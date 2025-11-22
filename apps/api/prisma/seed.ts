import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { HashService } from '../src/util/hash.service';

const connectionString = `${process.env.POSTGRES_DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
const hash = new HashService();

const permissionSubjects = [
  { key: 'role', label: 'Role Management' },
  { key: 'permission', label: 'Permission Management' },
  { key: 'user', label: 'User Management' },
  { key: 'folder', label: 'Folder Management' },
  { key: 'file', label: 'File Management' },
];

const permissionActions = ['create', 'read', 'update', 'delete'];

function titleCase(value: string) {
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function seedPermissions() {
  const permissionData = permissionSubjects.flatMap(subject =>
    permissionActions.map(action => ({
      subject: subject.key,
      action,
      description: `${titleCase(action)} ${subject.label}`,
    })),
  );

  await prisma.permission.createMany({
    data: permissionData,
    skipDuplicates: true,
  });

  return prisma.permission.findMany();
}

async function seedRoles() {
  const roles = [
    { name: 'Super Admin', description: 'Full access to every resource and action' },
    { name: 'Admin', description: 'Manage core resources except system-level settings' },
    { name: 'Viewer', description: 'Read-only access to core resources' },
  ];

  return Promise.all(
    roles.map(role =>
      prisma.role.upsert({
        where: { name: role.name },
        update: { description: role.description },
        create: role,
      }),
    ),
  );
}

async function seedRolePermissions(
  permissions: Array<{ id: number; subject: string; action: string }>,
  roles: Array<{ id: number; name: string }>,
) {
  const roleMap = new Map(roles.map(role => [role.name, role]));

  const superAdminRole = roleMap.get('Super Admin');
  const adminRole = roleMap.get('Admin');
  const viewerRole = roleMap.get('Viewer');

  if (!superAdminRole || !adminRole || !viewerRole) {
    throw new Error('Required roles not found');
  }

  const superAdminPermissions = permissions.map(permission => ({
    roleId: superAdminRole.id,
    permissionId: permission.id,
  }));

  const adminPermissions = permissions
    .filter(permission => permission.subject !== 'permission')
    .map(permission => ({
      roleId: adminRole.id,
      permissionId: permission.id,
    }));

  const viewerPermissions = permissions
    .filter(permission => permission.action === 'read')
    .map(permission => ({
      roleId: viewerRole.id,
      permissionId: permission.id,
    }));

  await prisma.rolePermission.createMany({
    data: [...superAdminPermissions, ...adminPermissions, ...viewerPermissions],
    skipDuplicates: true,
  });

  return roleMap;
}

async function seedSuperAdminUser(roleMap: Map<string, { id: number; name: string }>) {
  const password = await hash.generateHash('password');

  const superAdminUser = await prisma.user.upsert({
    where: { email: 'super.admin@example.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'super.admin@example.com',
      password,
      phone: '',
      nid: '',
      status: 'ACTIVE',
    },
  });

  const superAdminRole = roleMap.get('Super Admin');
  if (!superAdminRole) {
    throw new Error('Super Admin role not found');
  }

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: superAdminUser.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: superAdminUser.id,
      roleId: superAdminRole.id,
    },
  });
}

async function main() {
  try {
    const permissions = await seedPermissions();
    const roles = await seedRoles();
    const roleMap = await seedRolePermissions(permissions, roles);
    await seedSuperAdminUser(roleMap);
  } catch (error) {
    console.error('Seeding error:', error);
  }
}

main()
  .catch(error => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
