import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { protect, authorize } from './middleware/authMiddleware.js';

import { registerUser, loginUser, logoutUser } from './controllers/authController.js';
import { getAllUsers } from './controllers/userController.js';
import { createProject, getProjects } from './controllers/projectController.js';
import { createTask, getTasks, updateTaskStatus } from './controllers/taskController.js';

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5173',process.env.CLIENT_URL],
  credentials: true 
}));

const router = express.Router();


router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);
router.post('/auth/logout', logoutUser);

router.get('/users', protect, getAllUsers);

router.post('/projects', protect, authorize('ADMIN', 'MANAGER'), createProject);
router.get('/projects', protect, getProjects);

router.post('/tasks', protect, authorize('ADMIN', 'MANAGER'), createTask);
router.get('/tasks/:projectId', protect, getTasks);
router.patch('/tasks/:id/status', protect, updateTaskStatus);

router.get('/dashboard/stats', protect, async (req, res) => {
  if (req.user.role === 'ADMIN') {
    res.json({ message: "Admin Stats: Total Users, Active Projects" });
  } else if (req.user.role === 'MANAGER') {
    res.json({ message: "Manager Stats: Team Performance, Project Status" });
  } else {
    res.json({ message: "User Stats: My Pending Tasks" });
  }
});

app.use('/api', router);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));