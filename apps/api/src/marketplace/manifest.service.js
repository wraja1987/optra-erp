const crypto = require('crypto');

function validateManifest(manifest) {
  if (!manifest || manifest.name === undefined || !Array.isArray(manifest.oauthScopes)) throw new Error('invalid manifest');
  return true;
}

function signWebhook(payload, secret, nonce) {
  const data = JSON.stringify({ payload, nonce });
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

function verifyWebhook(payload, secret, nonce, signature) {
  const expected = signWebhook(payload, secret, nonce);
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
  } catch {
    return expected === signature;
  }
}

function install(appId, entitlements) {
  return { appId, entitlements, installedAt: new Date().toISOString() };
}

function uninstall(appId) {
  return { appId, uninstalledAt: new Date().toISOString() };
}

function skillRegistryEntry(name, tokenCap) {
  return { name, tokenCap, confirmCard: true };
}

module.exports = { validateManifest, signWebhook, verifyWebhook, install, uninstall, skillRegistryEntry };
