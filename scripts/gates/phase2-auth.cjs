const assert = require('assert');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { issueResetToken, verifyResetToken, markUsed } = require('../../apps/api/src/auth/reset.service.js');

(async()=>{
  const email = 'user1@example.com';
  // ensure user exists
  await prisma.eRPUser.upsert({ where:{ email }, update:{}, create:{ id: crypto.randomUUID(), tenant_id:'t1', email, role:'USER', passwordHash:null } });
  const { token } = await issueResetToken(email, '127.0.0.1', 'gate');
  const e = await verifyResetToken(token);
  assert.equal(e, email);
  await markUsed(token);
  const after = await verifyResetToken(token);
  assert.equal(after, null);
  console.log('PASS: Forgot Password DB token lifecycle');
  await prisma.$disconnect();
})();

