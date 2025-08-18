function validateManifest(manifest) {
  if (!manifest || typeof manifest.name !== 'string' || !Array.isArray(manifest.oauthScopes)) throw new Error('invalid manifest');
  return true;
}
function validateEntitlements(manifest, entitlements) {
  // Ensure requested scopes are covered by entitlements
  const ent = new Set(entitlements || []);
  return (manifest.oauthScopes || []).every(s => ent.has(s));
}
function stagedRollout(status) {
  if (!['beta','ga'].includes(status)) throw new Error('invalid stage');
  return { stage: status, enabled: true };
}
module.exports = { validateManifest, validateEntitlements, stagedRollout };
