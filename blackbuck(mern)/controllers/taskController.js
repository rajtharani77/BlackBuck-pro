import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// @desc    Create a new task (Now supports assigning by EMAIL)
// @route   POST /api/tasks
// @access  Admin & Manager
export const createTask = async (req, res) => {
  const { title, description, projectId, assignedToEmail, dueDate } = req.body; // CHANGED: assignedToEmail

  if (!title || !projectId) {
    return res.status(400).json({ message: 'Title and Project ID are required' });
  }

  try {
    let assignedToId = null;

    // LOGIC: If an email is provided, find that user's ID
    if (assignedToEmail) {
      const user = await prisma.user.findUnique({
        where: { email: assignedToEmail }
      });
      if (user) {
        assignedToId = user.id;
      } else {
        return res.status(404).json({ message: `User with email ${assignedToEmail} not found` });
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: 'TODO',
        projectId: Number(projectId),
        assignedToId: assignedToId, // Uses the ID we found from the email
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: { assignedTo: { select: { name: true, email: true } } }
    });
    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create task' });
  }
};

// @desc    Get tasks
// @route   GET /api/tasks/:projectId
export const getTasks = async (req, res) => {
  const { projectId } = req.params;
  const tasks = await prisma.task.findMany({
    where: { projectId: Number(projectId) },
    include: { 
      assignedTo: { select: { id: true, name: true, email: true } } 
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json(tasks);
};

// @desc    Update task status
export const updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const task = await prisma.task.findUnique({
      where: { id: Number(id) },
      include: { project: true }
    });

    if (!task) return res.status(404).json({ message: 'Task not found' });

    let isAuthorized = false;
    if (userRole === 'ADMIN') isAuthorized = true;
    else if (userRole === 'MANAGER' && task.project.managerId === userId) isAuthorized = true;
    else if (task.assignedToId === userId) isAuthorized = true;

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    const updatedTask = await prisma.task.update({
      where: { id: Number(id) },
      data: { status },
      include: { assignedTo: { select: { name: true, id: true } } }
    });
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Update failed' });
  }
};