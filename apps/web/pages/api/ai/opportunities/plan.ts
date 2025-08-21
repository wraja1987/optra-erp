import type { NextApiRequest, NextApiResponse } from 'next';
import { assertSuperAdmin } from './_rbac';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).end();
    assertSuperAdmin(req);
    const { id } = req.body || {};
    return res.status(200).json({
      ok: true,
      id: id || 'demo-1',
      plan: { summary: 'One-page plan', steps: ['Assess', 'Prototype', 'Gate'], risks: [], acceptanceCriteria: ['Demo passes'] }
    });
  } catch (e: any) {
    return res.status(e?.statusCode || 500).json({ error: e?.message || 'Error' });
  }
}
