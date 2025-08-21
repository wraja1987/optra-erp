import type { NextApiRequest } from 'next';

export function isFeatureEnabled() {
  const v = String(process.env.FEATURE_AI_OPPORTUNITIES || '').toLowerCase();
  return v === '1' || v === 'true' || v === 'on';
}

export function getRole(req: NextApiRequest) {
  // Next API routes expose req.cookies if using pages router
  const raw = (req as any).cookies?.role || '';
  return String(raw).toLowerCase();
}

export function assertSuperAdmin(req: NextApiRequest) {
  const enabled = isFeatureEnabled();
  const role = getRole(req);
  if (process.env.AI_OPPS_LOG === '1') {
    console.info('[AI_OPPS_AUTH]', { enabled, role });
  }
  if (!enabled) {
    const e: any = new Error('Feature disabled'); e.statusCode = 403; throw e;
  }
  if (role !== 'superadmin') {
    const e: any = new Error('Forbidden'); e.statusCode = 403; throw e;
  }
}
