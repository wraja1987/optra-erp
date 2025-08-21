import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { logAudit } from '../../../../../lib/audit';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const role = (req.cookies.role || '').toUpperCase();
  const actor = req.cookies.email || 'superadmin@optra.local';
  if (process.env.FEATURE_AI_OPPORTUNITIES !== '1' || role !== 'SUPERADMIN') {
    await logAudit('AI_OPPS_REJECT_403', null, actor, role);
    return res.status(403).json({ error: 'Forbidden' });
  }
  const id = Number(req.query.id);
  const reason = String(req.body?.reason || '');
  await prisma.opportunityDecision.create({ data: { opportunityId: id, decision: 'rejected', reason, decidedByUserId: 'superadmin', decidedAt: new Date() } });
  await logAudit('AI_OPPORTUNITY_REJECTED', JSON.stringify({ id, reason }), actor, role);
  res.status(200).json({ ok: true });
}


