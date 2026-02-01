import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminExists = await prisma.user.findFirst({
    where: { email: 'Admin@BlackBuck.com' }
  });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('testPassAdmin77', 10); 
    
    await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: 'Admin@BlackBuck.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    console.log('✅ Admin account created: Admin@BlackBuck.com');
  } else {
    console.log('⚠️  Admin already exists.');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());