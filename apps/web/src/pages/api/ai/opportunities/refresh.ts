import type { NextApiRequest, NextApiResponse } from 'next';
import { assertSuperAdmin } from '@/server/lib/aiOppsAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    assertSuperAdmin(req);
    res.status(200).json({ ok: true, refreshed: true });
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
}
