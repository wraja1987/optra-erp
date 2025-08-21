import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { logAudit } from '../../../../lib/audit';

const prisma = new PrismaClient();

function isEnabled(req: NextApiRequest) {
  return process.env.FEATURE_AI_OPPORTUNITIES === '1';
}
function isSuperAdmin(req: NextApiRequest) {
  return (req.cookies.role || '').toUpperCase() === 'SUPERADMIN';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isEnabled(req) || !isSuperAdmin(req)) {
    await logAudit('AI_OPPS_LIST_403', null, undefined, (req.cookies.role || '').toUpperCase());
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { category, minValue, effort } = req.query as Record<string, string>;
  const where: any = {};
  if (category) where.category = category;
  if (effort) where.effort = effort;
  if (minValue) where.valueScore = { gte: Number(minValue) };
  const list = await prisma.opportunity.findMany({ where, orderBy: { valueScore: 'desc' } });
  res.status(200).json({ items: list });
}


