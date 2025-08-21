import type { NextApiRequest, NextApiResponse } from 'next';
import { logAudit } from '../../../../lib/audit';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const role = (req.cookies.role || '').toUpperCase();
  if (!['ADMIN', 'SUPERADMIN'].includes(role)) {
    await logAudit('AI_THEME_ROLLBACK_403', null, undefined, role);
    return res.status(403).json({ error: 'Forbidden' });
  }
  const pub = path.join(process.cwd(), 'apps', 'web', 'public');
  const current = path.join(pub, 'theme.json');
  const backups = fs.readdirSync(pub).filter(f => f.startsWith('theme.backup.')).sort().reverse();
  if (!backups.length) return res.status(400).json({ error: 'No backups' });
  const latest = path.join(pub, backups[0]);
  try {
    fs.copyFileSync(latest, current);
    await logAudit('AI_THEME_ROLLBACK', JSON.stringify({ from: backups[0] }));
    res.status(200).json({ ok: true });
  } catch (e:any) {
    await logAudit('AI_THEME_ROLLBACK_FAIL', String(e));
    res.status(500).json({ error: 'Rollback failed' });
  }
}


