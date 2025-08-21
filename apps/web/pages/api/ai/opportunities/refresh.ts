import type { NextApiRequest, NextApiResponse } from 'next';
import { assertSuperAdmin } from './_rbac';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).end();
    assertSuperAdmin(req);
    // Stub: pretend we refreshed recommendations successfully
    return res.status(200).json({ ok: true, refreshed: true, count: 5 });
  } catch (e: any) {
    return res.status(e?.statusCode || 500).json({ error: e?.message || 'Error' });
  }
}
