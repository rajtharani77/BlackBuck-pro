import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getAllUsers = async (req, res) => {
  try {
    let whereClause = {};

    if (req.user.role === 'MANAGER') {
      whereClause = { 
        role: { not: 'ADMIN' } 
      };
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: { id: true, name: true, email: true, role: true }, 
      orderBy: { name: 'asc' }
    });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};