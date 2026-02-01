import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: true, 
    sameSite: 'none',
    maxAge: 30 * 24 * 60 * 60 * 1000 
  });
};

export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (role === 'ADMIN') {
    return res.status(403).json({ message: 'Admin registration is restricted.' });
  }

  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists) return res.status(400).json({ message: 'User already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role }
  });

  if (user) {
    generateToken(res, user.id);
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (user && (await bcrypt.compare(password, user.password))) {
    generateToken(res, user.id);
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

export const logoutUser = (req, res) => {
  res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ message: 'Logged out' });
};
