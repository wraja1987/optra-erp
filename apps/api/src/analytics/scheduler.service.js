const crypto = require('crypto');

function createSignedLink(reportId, ttlMinutes) {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + Number(ttlMinutes) * 60;
  const token = crypto.randomBytes(8).toString('hex');
  return { reportId, token, expiresAt };
}

function isLinkValid(link, nowEpochSeconds) {
  return (nowEpochSeconds || Math.floor(Date.now() / 1000)) < link.expiresAt;
}

module.exports = { createSignedLink, isLinkValid };
