import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { logAudit } from '../../../../../lib/audit';

const prisma = new PrismaClient();

function maskPII(input: string): string {
  return input.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[EMAIL]').replace(/\b\d{10,16}\b/g, '[NUMBER]');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const role = (req.cookies.role || '').toUpperCase();
  if (process.env.FEATURE_AI_OPPORTUNITIES !== '1' || role !== 'SUPERADMIN') {
    await logAudit('AI_OPPS_PLAN_403', null, undefined, role);
    return res.status(403).json({ error: 'Forbidden' });
  }
  const id = Number(req.query.id);
  const opp = await prisma.opportunity.findUnique({ where: { id } });
  if (!opp) return res.status(404).json({ error: 'Not found' });

  const tokenCap = Number(process.env.AI_OPPS_TOKEN_CAP || 2000);
  const prompt = `Create a one-page plan for ${opp.title} (${opp.category}).`;
  const masked = maskPII(prompt);
  if (masked.length > tokenCap) return res.status(400).json({ error: 'Token cap exceeded' });

  const plan = {
    summary: `Implement ${opp.title} with emphasis on value (score ${opp.valueScore}) and effort ${opp.effort}.` ,
    steps: [ 'Discovery', 'Design', 'Build', 'Test', 'Deploy' ],
    risks: [ opp.risk || 'Low' ],
    acceptanceCriteria: [ 'Meets performance budgets', 'A11y passes', 'Audit logs created' ]
  };
  await logAudit('AI_OPPS_PLAN', JSON.stringify({ id, masked, plan }));
  res.status(200).json({ plan });
}


