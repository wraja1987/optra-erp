import { PrismaClient } from '@prisma/client';
import crypto from 'node:crypto';

const prisma = new PrismaClient();

async function main() {
  const superEmail = process.env.SUPERADMIN_EMAIL || 'info@chiefaa.com';
  const superPass  = process.env.SUPERADMIN_PASSWORD || '12345678';
  const adminEmail = process.env.COMPANYADMIN_EMAIL || 'chiefaaltd@gmail.com';
  const adminPass  = process.env.COMPANYADMIN_PASSWORD || 'Wolfish123';

  const hash = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

  // Tenant
  const tenant = await prisma.workspaceUnit.upsert({
    where: { code: 'DEMO' },
    update: {},
    create: { code: 'DEMO', name: 'Demo Tenant' },
  });

  // Roles
  const roleSuper   = await prisma.role.upsert({ where: { key: 'SUPER_ADMIN'   }, update: {}, create: { key: 'SUPER_ADMIN',   name: 'Super Admin',   system: true }});
  const roleCompany = await prisma.role.upsert({ where: { key: 'COMPANY_ADMIN' }, update: {}, create: { key: 'COMPANY_ADMIN', name: 'Company Admin', system: true }});
  await prisma.role.upsert({ where: { key: 'USER' }, update: {}, create: { key: 'USER', name: 'Standard User', system: true }});

  // Users
  const superUser = await prisma.eRPUser.upsert({
    where: { email: superEmail },
    update: { passwordHash: hash(superPass), immutable: true, status: 'ACTIVE' },
    create: { tenant_id: tenant.id, email: superEmail, role: 'SUPER_ADMIN', passwordHash: hash(superPass), immutable: true, status: 'ACTIVE' },
  });

  const companyAdmin = await prisma.eRPUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash: hash(adminPass), status: 'ACTIVE' },
    create: { tenant_id: tenant.id, email: adminEmail, role: 'COMPANY_ADMIN', passwordHash: hash(adminPass), status: 'ACTIVE' },
  });

  // Link roles
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: superUser.id, roleId: roleSuper.id } },
    update: {},
    create: { userId: superUser.id, roleId: roleSuper.id },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: companyAdmin.id, roleId: roleCompany.id } },
    update: {},
    create: { userId: companyAdmin.id, roleId: roleCompany.id, tenantId: tenant.id },
  });

  // SoD sample
  await prisma.sodPolicy.upsert({
    where: { key: 'PAYROLL_FINALISE_REQUIRES_APPROVER' },
    update: {},
    create: { key: 'PAYROLL_FINALISE_REQUIRES_APPROVER', description: 'Maker-checker: payroll finalisation requires a separate approver', active: true },
  });

  // Audit
  await prisma.auditLog.createMany({
    data: [
      { actorEmail: superEmail, role: 'SUPER_ADMIN', action: 'SEED_SUPERADMIN',   details: 'Immutable Super Admin created/updated' },
      { actorEmail: adminEmail, role: 'COMPANY_ADMIN', action: 'SEED_COMPANYADMIN', details: 'Company Admin created/updated for DEMO tenant' },
    ],
  });

  console.log('Seed complete:', { tenant: 'DEMO', superAdmin: superEmail, companyAdmin: adminEmail });
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });



