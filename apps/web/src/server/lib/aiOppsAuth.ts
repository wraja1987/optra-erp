export function assertSuperAdmin(req: any) {
  const enabled = process.env.FEATURE_AI_OPPORTUNITIES === '1';
  const role = (req.cookies?.role || '').toLowerCase();
  if (process.env.AI_OPPS_LOG === '1') {
    console.log('[AI_OPPS_AUTH]', { enabled, role });
  }
  if (!enabled) throw new Error('AI Opportunities disabled');
  if (role !== 'superadmin') throw new Error('Forbidden');
}
