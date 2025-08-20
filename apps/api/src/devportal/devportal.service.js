function validateManifest(manifest) {
  return !!(manifest && manifest.name && Array.isArray(manifest.oauthScopes));
}

function validateEntitlements(manifest, required) {
  const set = new Set(manifest.oauthScopes || []);
  return required.every(r => set.has(r));
}

function stagedRollout(stage) {
  return { stage, enabled: ['alpha', 'beta', 'ga'].includes(stage) };
}

module.exports = { validateManifest, validateEntitlements, stagedRollout };

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
