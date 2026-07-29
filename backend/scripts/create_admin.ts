import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/utils/database';

async function main() {
  const email = 'admin@boldvan.com';
  const password = 'Googleverified1@';

  const existing = await prisma.user.findUnique({ where: { email } });
  const hashed = await bcrypt.hash(password, 10);

  if (existing) {
    console.log(`User already exists: ${existing.email}`);
    await prisma.user.update({
      where: { email },
      data: {
        password: hashed,
        role: 'ADMIN'
      }
    });
    console.log('Updated existing user to role ADMIN and reset password.');
  } else {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        role: 'ADMIN'
      }
    });
    console.log(`Admin user created: ${user.email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
