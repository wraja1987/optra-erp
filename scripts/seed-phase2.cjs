const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  // Help & Docs
  const roles = ['Standard','Admin','Super Admin'];
  const guideCount = await prisma.helpGuide.count();
  if (guideCount < 15) {
    const guides = [];
    for (const role of roles){
      for (let i=1;i<=5;i++) guides.push({ role, title:`${role} Guide ${i}`, body:`Content for ${role} guide ${i}` });
    }
    await prisma.helpGuide.createMany({ data: guides });
  }
  const faqCount = await prisma.helpFAQ.count();
  if (faqCount < 10) await prisma.helpFAQ.createMany({ data: Array.from({length:10}).map((_,i)=>({ question:`FAQ ${i+1}?`, answer:`Answer ${i+1}.` })) });
  await prisma.helpGlossary.createMany({ data: Array.from({length:30}).map((_,i)=>({ term:`Term${i+1}`, definition:`Definition ${i+1}` })), skipDuplicates: true });
  const rnCount = await prisma.helpReleaseNote.count();
  if (rnCount === 0) await prisma.helpReleaseNote.create({ data:{ version:'1.0.0', notes:'Initial Phase 2 release' } });
  const vidCount = await prisma.helpVideoStub.count();
  if (vidCount < 3) await prisma.helpVideoStub.createMany({ data:[{title:'Intro 1', url:'#'},{title:'Intro 2', url:'#'},{title:'Intro 3', url:'#'}] });

  // Support message example
  const sm = await prisma.supportMessage.count();
  if (sm === 0) await prisma.supportMessage.create({ data:{ email:'user@example.com', role:'Standard', subject:'Test', message:'Hello support' } });

  // Budgets sample
  const b = await prisma.budget.count();
  if (b < 3) await prisma.budget.createMany({ data:[
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
  ], skipDuplicates: true });

  console.log('Phase 2 seed complete');
  await prisma.$disconnect();
})();

