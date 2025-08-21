import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { logAudit } from '../../../../lib/audit';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const role = (req.cookies.role || '').toUpperCase();
  if (process.env.FEATURE_AI_OPPORTUNITIES !== '1' || role !== 'SUPERADMIN') {
    await logAudit('AI_OPPS_REFRESH_403', null, undefined, role);
    return res.status(403).json({ error: 'Forbidden' });
  }
  // Stub refresh: upsert a few curated items if missing
  const items = [
    { slug:'woocommerce-connector', title:'WooCommerce connector', category:'Integration', valueScore:80, effort:'M', risk:'Medium' },
    { slug:'timesheet-mobile-capture', title:'Timesheet mobile capture', category:'Feature', valueScore:75, effort:'S', risk:'Low' },
    { slug:'ocr-vendor-b-multicurrency', title:'OCR vendor B (multi‑currency)', category:'Integration', valueScore:70, effort:'M', risk:'Medium' },
    { slug:'powerbi-push-dataset', title:'Power BI push dataset', category:'Integration', valueScore:65, effort:'M', risk:'Low' },
    { slug:'bank-auto-match-tuning', title:'Bank feed auto‑match tuning', category:'Feature', valueScore:60, effort:'S', risk:'Low' },
    { slug:'office-addin-merge', title:'Office add‑in for document merge', category:'Feature', valueScore:55, effort:'M', risk:'Low' },
  ];
  for (const it of items) {
    await prisma.opportunity.upsert({ where:{ slug: it.slug }, update: {}, create: { ...it } });
  }
  await logAudit('AI_OPPS_REFRESH', JSON.stringify({ count: items.length }));
  res.status(200).json({ ok:true, count: items.length });
}


