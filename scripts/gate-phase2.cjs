const { execSync } = require('child_process');
const fs = require('fs');
function ok(s){ console.log(`PASS: ${s}`); }
function fail(s,e){ console.error(`FAIL: ${s}: ${e?.message||e}`); process.exitCode=1; }

(async()=>{
  try{
    if(!fs.existsSync('v5-ultra-erp/apps/web/public/logo-optra.png')) throw new Error('logo-optra.png');
    ok('Branding asset present');

    const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
    for (const key of ['a11y']){ if(!pkg.scripts[key]) throw new Error(`${key} script missing`); }
    ok('UI a11y scripts');

    // Validate seeds produced content
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const g = await prisma.helpGuide.count();
    const faq = await prisma.helpFAQ.count();
    const gl = await prisma.helpGlossary.count();
    if (g < 15 || faq < 10 || gl < 30) throw new Error('helpdocs seeds insufficient');
    ok('HelpDocs seeded');
    await prisma.$disconnect();

  }catch(e){ fail('Phase2 gate', e); }
})();


