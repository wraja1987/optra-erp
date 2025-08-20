const crypto = require('crypto');

function evidenceHash(payload) {
  const json = JSON.stringify(payload || {});
  const hash = crypto.createHash('sha256').update(json).digest('hex');
  return { hash, timestamp: Date.now() };
}

module.exports = { evidenceHash };
