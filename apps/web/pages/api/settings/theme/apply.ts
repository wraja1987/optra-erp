import type { NextApiRequest, NextApiResponse } from 'next';
import { logAudit } from '../../../../lib/audit';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const role = (req.cookies.role || '').toUpperCase();
  if (!['ADMIN', 'SUPERADMIN'].includes(role)) {
    await logAudit('AI_THEME_APPLY_403', null, undefined, role);
    return res.status(403).json({ error: 'Forbidden' });
  }
  const tokens = req.body?.tokens || {};
  const target = path.join(process.cwd(), 'apps', 'web', 'public', 'theme.json');
  const backup = path.join(process.cwd(), 'apps', 'web', 'public', `theme.backup.${Date.now()}.json`);
  try {
    if (fs.existsSync(target)) fs.copyFileSync(target, backup);
    fs.writeFileSync(target, JSON.stringify(tokens, null, 2));
    await logAudit('AI_THEME_APPLY', JSON.stringify({ tokens }));
    res.status(200).json({ ok: true });
  } catch (e:any) {
    await logAudit('AI_THEME_APPLY_FAIL', String(e));
    res.status(500).json({ error: 'Apply failed' });
  }
}


