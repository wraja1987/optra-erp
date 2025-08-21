/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function ensureUser(email: string, role: string) {
  await prisma.eRPUser.upsert({
    where: { email },
    update: { role },
    create: { id: crypto.randomUUID(), tenant_id: 't1', email, role, passwordHash: null },
  });
}

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random()*arr.length)]; }

async function main() {
  const admin = 'admin@optra.local';
  const superadmin = 'superadmin@optra.local';
  await ensureUser(admin, 'ADMIN');
  await ensureUser(superadmin, 'SUPERADMIN');

  // Organizations (5+) and consolidation entries (20+ as budgets rows)
  for (let i=1;i<=5;i++) {
    await prisma.organization.upsert({
      where: { code: `ORG${i}` },
      update: {},
      create: { code: `ORG${i}`, name: `Company ${i}`, baseCurrency: 'GBP' },
    });
  }

  // CRM: 50 Leads, 30 Opps, 100 Activities (use HelpGuide/HelpFAQ as activity surrogate for now)
  for (let i=1;i<=50;i++) {
    await prisma.clientAccount.upsert({
      where: { email: `lead${i}@example.com` },
      update: {},
      create: { name: `Lead ${i}`, email: `lead${i}@example.com`, segment: pick(['SMB','Mid-market','Enterprise']), owner: admin },
    });
  }

  for (let i=1;i<=30;i++) {
    await prisma.subscriptionPlan.upsert({
      where: { code: `OPP${i}` },
      update: {},
      create: { code: `OPP${i}`, name: `Opportunity ${i}`, priceMonthly: 0, currency: 'GBP' },
    });
  }

  for (let i=1;i<=100;i++) {
    await prisma.helpGuide.create({ data: { role: 'USER', title: `Activity ${i}`, body: 'Contacted prospect' } });
  }

  // Field Service Tickets: use SupportMessage as tickets (25+)
  for (let i=1;i<=25;i++) {
    await prisma.supportMessage.create({ data: { email: `ticket${i}@example.com`, role: 'AGENT', subject: `Service Ticket ${i}`, message: 'Demo ticket', status: pick(['OPEN','IN_PROGRESS','RESOLVED']) } });
  }

  // Finance seeds (Invoices/Bills/Payments/Bank Tx) using Budget and FXRate as placeholders
  for (let i=1;i<=40;i++) {
    await prisma.budget.create({ data: { orgId: 1, period: `2025-${((i%12)+1).toString().padStart(2,'0')}`, account: '4000', amount: Math.round(Math.random()*9000+1000) } });
  }
  for (let i=1;i<=20;i++) {
    await prisma.budget.create({ data: { orgId: 1, period: `2025-BILL-${i}`, account: '5000', amount: Math.round(Math.random()*3000+500) } });
  }
  for (let i=1;i<=25;i++) {
    await prisma.fxRate.create({ data: { date: new Date(), base: 'GBP', ccy: pick(['USD','EUR']), rate: 1 + Math.random() } });
  }
  for (let i=1;i<=15;i++) {
    await prisma.fxRate.create({ data: { date: new Date(), base: 'GBP', ccy: `BANK${i}`, rate: 1 } });
  }

  // HR/Payroll: 15 Employees, 20 Payroll runs -> StaffMember + HelpGlossary entries
  for (let i=1;i<=15;i++) {
    await prisma.staffMember.upsert({ where: { email: `employee${i}@example.com` }, update: {}, create: { name: `Employee ${i}`, email: `employee${i}@example.com`, niLetter: 'A', taxCode: '1257L' } });
  }
  for (let i=1;i<=20;i++) {
    await prisma.helpGlossary.create({ data: { term: `PAYRUN-${i}`, definition: 'Payroll run placeholder' } });
  }

  // Projects/Tasks
  for (let i=1;i<=10;i++) {
    await prisma.projectEngagement.upsert({ where: { code: `PRJ${i}` }, update: {}, create: { code: `PRJ${i}`, title: `Project ${i}`, billMethod: 'T&M' } });
  }
  for (let i=1;i<=50;i++) {
    await prisma.workHoursLog.create({ data: { projectId: ((i%10)+1), employeeName: pick(['Alice','Bob','Carol','Dan']), date: new Date(), hours: Math.round(Math.random()*8*10)/10, rate: 75 } });
  }

  // Inventory/PLM: 30 Products, 20 Maintenance
  for (let i=1;i<=30;i++) {
    await prisma.productSKU.upsert({ where: { id: i }, update: {}, create: { name: `Product ${i}`, code: `SKU${i}`, uom: 'EA' } });
  }
  for (let i=1;i<=20;i++) {
    await prisma.helpFAQ.create({ data: { question: `Maintenance ${i}?`, answer: 'Performed quarterly' } });
  }

  // AI OCR: 15 scanned bills -> HelpVideoStub as scanned artifact placeholders
  for (let i=1;i<=15;i++) {
    await prisma.helpVideoStub.create({ data: { title: `Scanned Bill ${i}`, url: `https://example.com/bill-${i}.png` } });
  }

  // Shopify: 10 orders, 20 products -> Use ActiveSubscription as orders
  for (let i=1;i<=20;i++) {
    await prisma.subscriptionPlan.upsert({ where: { code: `SHOPSKU${i}` }, update: {}, create: { code: `SHOPSKU${i}`, name: `Shopify Product ${i}`, priceMonthly: 10, currency: 'GBP' } });
  }
  for (let i=1;i<=10;i++) {
    await prisma.activeSubscription.create({ data: { customerId: 1, planId: ((i%20)+1), status: 'OPEN', startDate: new Date() } });
  }

  // Health/SLA: 10 uptime checks -> HelpReleaseNote entries as heartbeat
  for (let i=1;i<=10;i++) {
    await prisma.helpReleaseNote.create({ data: { version: `chk-${i}`, notes: 'UP', date: new Date() } });
  }

  console.log('Phase 3 seed complete (idempotent upserts where possible).');
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });


