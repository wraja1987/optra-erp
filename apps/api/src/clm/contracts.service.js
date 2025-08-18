const crypto = require('node:crypto');
function evidenceHash(payload) {
  const json = JSON.stringify(payload);
  const hash = crypto.createHash('sha256').update(json).digest('hex');
  return { hash, timestamp: new Date().toISOString() };
}
module.exports = { evidenceHash };
