import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function logAudit(action: string, details: string | null, actorEmail?: string, role?: string) {
  try {
    await prisma.auditLog.create({ data: { actorEmail: actorEmail || 'system', role: role || null, action, details: details || null } });
  } catch (e) {
    // ignore to avoid breaking flows
    console.warn('[audit] failed', e);
  }
}


