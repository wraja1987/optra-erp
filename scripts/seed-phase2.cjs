const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  // Help & Docs
  const roles = ['Standard','Admin','Super Admin'];
  for (const role of roles){
    for (let i=1;i<=5;i++){
      await prisma.helpGuide.upsert({
        where:{ id: 0 }, // force create via createMany instead
        update:{},
        create:{ role, title:`${role} Guide ${i}`, body:`Content for ${role} guide ${i}` }
      }).catch(()=>{});
    }
  }
  await prisma.$transaction([
    prisma.helpFAQ.createMany({ data: Array.from({length:10}).map((_,i)=>({ question:`FAQ ${i+1}?`, answer:`Answer ${i+1}.` })) }),
    prisma.helpGlossary.createMany({ data: Array.from({length:30}).map((_,i)=>({ term:`Term${i+1}`, definition:`Definition ${i+1}` })) }),
    prisma.helpReleaseNote.create({ data:{ version:'1.0.0', notes:'Initial Phase 2 release' } }),
    prisma.helpVideoStub.createMany({ data:[{title:'Intro 1', url:'#'},{title:'Intro 2', url:'#'},{title:'Intro 3', url:'#'}] }),
  ]);

  // Support message example
  await prisma.supportMessage.create({ data:{ email:'user@example.com', role:'Standard', subject:'Test', message:'Hello support' } });

  // Budgets sample
  await prisma.budget.createMany({ data:[
    { orgId:1, period:'2024-01', account:'4000', amount: 10000 },
    { orgId:1, period:'2024-02', account:'4000', amount: 11000 },
    { orgId:1, period:'2024-03', account:'4000', amount: 12000 },
  ]});

  // FX rates sample
  const today = new Date();
  await prisma.fXRate.createMany({ data:[
    { date: today, base:'GBP', ccy:'EUR', rate:1.15 },
    { date: today, base:'GBP', ccy:'USD', rate:1.27 },
    { date: today, base:'GBP', ccy:'JPY', rate:200.0 },
  ]});

  console.log('Phase 2 seed complete');
  await prisma.$disconnect();
})();

