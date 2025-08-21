import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { logAudit } from '../../../../../lib/audit';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const role = (req.cookies.role || '').toUpperCase();
  const actor = req.cookies.email || 'superadmin@optra.local';
  if (process.env.FEATURE_AI_OPPORTUNITIES !== '1' || role !== 'SUPERADMIN') {
    await logAudit('AI_OPPS_ACCEPT_403', null, actor, role);
    return res.status(403).json({ error: 'Forbidden' });
  }
  const id = Number(req.query.id);
  const plan = req.body?.plan || {};
  await prisma.opportunityPlan.create({ data: { opportunityId: id, summary: plan.summary || 'Plan', steps: plan.steps || [], risks: plan.risks || [], acceptanceCriteria: plan.acceptanceCriteria || [] } });
  await prisma.opportunityDecision.create({ data: { opportunityId: id, decision: 'accepted', reason: null, decidedByUserId: 'superadmin', decidedAt: new Date() } });
  await logAudit('AI_OPPORTUNITY_ACCEPTED', JSON.stringify({ id, plan }), actor, role);
  res.status(200).json({ ok: true });
}


