const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main () {
  const company = await prisma.company.upsert({ where:{code:'DEMO'}, update:{}, create:{ code:'DEMO', name:'Demo Ltd', baseCurrency:'GBP' }});
  const wh = await prisma.warehouse.upsert({ where:{code:'MAIN'}, update:{}, create:{ code:'MAIN', name:'Main Warehouse' }});
  const item = await prisma.item.upsert({ where:{sku:'SKU-1001'}, update:{}, create:{ sku:'SKU-1001', name:'Demo Widget', uom:'EA' }});
  await prisma.inventoryOnHand.upsert({ where:{warehouseId_itemId:{warehouseId:wh.id,itemId:item.id}}, update:{qty:250}, create:{warehouseId:wh.id,itemId:item.id,qty:250}});
  const cust = await prisma.customer.upsert({ where:{email:'customer@example.com'}, update:{}, create:{ name:'Acme Trading', email:'customer@example.com' }});
  const plan = await prisma.subscriptionPlan.upsert({ where:{code:'STD'}, update:{}, create:{ code:'STD', name:'Standard', priceMonthly:9900, currency:'GBP' }});
  await prisma.subscription.upsert({ where:{customerId_planId:{customerId:cust.id,planId:plan.id}}, update:{}, create:{ customerId:cust.id, planId:plan.id, status:'ACTIVE', startDate:new Date() }});
  const proj = await prisma.project.upsert({ where:{code:'PRJ-100'}, update:{}, create:{ code:'PRJ-100', name:'Implementation', billMethod:'T_AND_M' }});
  await prisma.timesheet.create({ data:{ projectId:proj.id, employeeName:'Demo User', date:new Date(), hours:7.5, rate:50 }});
  await prisma.employee.upsert({ where:{email:'staff@demo.com'}, update:{}, create:{ name:'Staff Member', email:'staff@demo.com', niLetter:'A', taxCode:'1257L' }});
  await prisma.pickWave.create({ data:{ warehouseId:wh.id, status:'PLANNED' }});
  console.log('✅ Seed complete');
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
