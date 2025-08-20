const assert = require('assert');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async()=>{
  const guides = await prisma.helpGuide.findMany();
  assert.ok(guides.length >= 15);
  const release = await prisma.helpReleaseNote.count();
  assert.equal(release >= 1, true);
  const videos = await prisma.helpVideoStub.count();
  assert.equal(videos >= 3, true);
  console.log('PASS: Help & Docs seeded and present');
  await prisma.$disconnect();
})();

