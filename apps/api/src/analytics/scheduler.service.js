const crypto = require('node:crypto');
function createSignedLink(reportId, ttlSeconds) {
  const token = crypto.randomBytes(16).toString('hex');
  const expiresAt = Math.floor(Date.now()/1000) + ttlSeconds;
  return { token, expiresAt };
}
function isLinkValid(link, nowSec) { return nowSec <= link.expiresAt; }
module.exports = { createSignedLink, isLinkValid };
