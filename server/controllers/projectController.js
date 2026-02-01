import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createProject = async (req, res) => {
  const { name, description, memberIds, assignedManagerId } = req.body; 

  if (!name) return res.status(400).json({ message: 'Project name is required' });

  let managerId = req.user.id; 
  if (req.user.role === 'ADMIN' && assignedManagerId) {
    managerId = Number(assignedManagerId);
  }

  try {
    const project = await prisma.project.create({
      data: {
        name,
        description,
        managerId: managerId,
        members: {
          connect: memberIds?.map((id) => ({ id: Number(id) })) || [],
        },
      },
      include: { members: true, manager: true },
    });

    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create project' });
  }
};

export const getProjects = async (req, res) => {
  let where = {};

  if (req.user.role === 'ADMIN') {
    where = {}; 
  } else if (req.user.role === 'MANAGER') {
    where = { managerId: req.user.id }; 
  } else {
    where = { members: { some: { id: req.user.id } } };
  }

  const projects = await prisma.project.findMany({
    where,
    include: { 
      manager: { select: { name: true, email: true } },
      members: { select: { name: true } } 
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json(projects);
};

export const getProjectById = async (req, res) => {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
        where: { id: Number(id) },
        include: { members: true, manager: true }
    });
    if(!project) return res.status(404).json({message: "Project not found"});
    res.json(project);
}