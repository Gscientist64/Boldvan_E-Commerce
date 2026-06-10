import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateExistingAdmins() {
  console.log('Starting migration of existing admin users to new role system...');

  // Find or create Super Admin role
  let superAdminRole = await prisma.role.findUnique({
    where: { name: 'Super Admin' }
  });

  if (!superAdminRole) {
    superAdminRole = await prisma.role.create({
      data: {
        name: 'Super Admin',
        description: 'Full system access with all permissions',
        isSystem: true,
        permissions: Object.values(require('@prisma/client').Permission)
      }
    });
    console.log('Created Super Admin role');
  }

  // Find all existing admin users
  const adminUsers = await prisma.user.findMany({
    where: { role: 'ADMIN' }
  });

  console.log(`Found ${adminUsers.length} admin users to migrate`);

  // Assign Super Admin role to each existing admin
  for (const admin of adminUsers) {
    await prisma.userRoleAssignment.upsert({
      where: {
        userId_roleId: {
          userId: admin.id,
          roleId: superAdminRole.id
        }
      },
      update: {},
      create: {
        userId: admin.id,
        roleId: superAdminRole.id,
        assignedBy: 'system'
      }
    });
    console.log(`Assigned Super Admin role to ${admin.email}`);
  }

  console.log('Migration completed successfully');
}

migrateExistingAdmins()
  .catch(console.error)
  .finally(() => prisma.$disconnect());