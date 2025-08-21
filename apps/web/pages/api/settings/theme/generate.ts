import type { NextApiRequest, NextApiResponse } from 'next';
import { logAudit } from '../../../../lib/audit';

function maskPII(input: string): string {
  return input
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[EMAIL]')
    .replace(/\b\d{10,16}\b/g, '[NUMBER]');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const role = (req.cookies.role || '').toUpperCase();
  if (!['ADMIN', 'SUPERADMIN'].includes(role)) {
    await logAudit('AI_THEME_GENERATE_403', null, undefined, role);
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (process.env.FEATURE_FLAG_THEME_AI !== '1') {
    return res.status(400).json({ error: 'Feature disabled' });
  }

  const { prompt } = req.body || {};
  const masked = prompt ? maskPII(String(prompt)) : '';
  const tokenCap = Number(process.env.THEME_AI_TOKEN_CAP || 400);
  if (masked.length > tokenCap) {
    return res.status(400).json({ error: 'Token cap exceeded' });
  }

  // If OPENAI_API_KEY present, you can integrate real generation; here we synthesize a professional Optra theme
  const tokens = {
    brandPrimary: '#0b5fff',
    brandOnPrimary: '#ffffff',
    bg: '#ffffff',
    fg: '#0b0d14',
    surface: '#f8fafc',
    border: '#e1e6ef',
    dark_bg: '#0b0d14',
    dark_fg: '#e7ecf3',
    dark_surface: '#121723',
    dark_border: '#22304a'
  };

  await logAudit('AI_THEME_GENERATE', JSON.stringify({ masked, tokens }));
  res.status(200).json({ tokens, masked });
}


