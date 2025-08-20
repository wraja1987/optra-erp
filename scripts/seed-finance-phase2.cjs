const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async()=>{
  // Create a sample bank CSV with 5 rows including 4 invoice refs to enable >=80% match
  const csv = [
    'date,amount,reference',
    '2024-01-01,100.00,INV-001 John',
    '2024-01-02,200.00,INV-002 Jane',
    '2024-01-03,300.00,INV-003 ACME',
    '2024-01-04,400.00,INV-004 Foo',
    '2024-01-05,500.00,INV-XXX Miss'
  ].join('\n');
  const out = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(out)) fs.mkdirSync(out);
  fs.writeFileSync(path.join(out, 'bank.csv'), csv);

  // Golden file placeholders for fixed assets and tax drafts
  const goldenDir = path.join(process.cwd(),'golden');
  if (!fs.existsSync(goldenDir)) fs.mkdirSync(goldenDir);
  fs.writeFileSync(path.join(goldenDir,'fixed-assets-draft.json'), JSON.stringify({ example:true },null,2));
  fs.writeFileSync(path.join(goldenDir,'tax-cis300.json'), JSON.stringify({ example:true },null,2));
  fs.writeFileSync(path.join(goldenDir,'tax-intrastat.json'), JSON.stringify({ example:true },null,2));
  fs.writeFileSync(path.join(goldenDir,'tax-deferred-vat.json'), JSON.stringify({ example:true },null,2));

  // Seed minimal org for budgets/periods
  await prisma.organization.upsert({ where:{ id:1 }, update:{}, create:{ id:1, code:'ORG', name:'Optra Org', baseCurrency:'GBP' } }).catch(()=>{});

  console.log('Finance Phase 2 seed complete');
  await prisma.$disconnect();
})();

