const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function sha256(s){ return crypto.createHash('sha256').update(s).digest('hex'); }

async function throttleAllowed(email){
  const since = new Date(Date.now() - 5*60*1000);
  const count = await prisma.passwordReset.count({ where:{ email, createdAt: { gte: since } } });
  return count < 3;
}

async function issueResetToken(email, ip, userAgent){
  if (!(await throttleAllowed(email))) throw new Error('Too many requests');
  const token = crypto.randomBytes(24).toString('hex');
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + 30*60*1000);
  await prisma.passwordReset.create({ data:{ email: email.toLowerCase(), tokenHash, expiresAt, ip, userAgent } });
  return { token, expiresAt };
}

async function verifyResetToken(token){
  const tokenHash = sha256(token);
  const rec = await prisma.passwordReset.findUnique({ where:{ tokenHash } });
  if (!rec || rec.used) return null;
  if (rec.expiresAt.getTime() < Date.now()) return null;
  return rec.email;
}

async function markUsed(token){
  const tokenHash = sha256(token);
  await prisma.passwordReset.update({ where:{ tokenHash }, data:{ used: true } });
}

module.exports = { issueResetToken, verifyResetToken, markUsed };


