import type { NextApiRequest, NextApiResponse } from 'next';
import { assertSuperAdmin } from './_rbac';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') return res.status(405).end();
    assertSuperAdmin(req);
    // Stub list; avoid Prisma fields that caused schema mismatch
    return res.status(200).json({ items: [{ id: 'demo-1', title: 'WooCommerce connector' }] });
  } catch (e: any) {
    return res.status(e?.statusCode || 500).json({ error: e?.message || 'Error' });
  }
}
