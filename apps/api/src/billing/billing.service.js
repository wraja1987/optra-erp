function createPlan(name, price) { return { id: name.toLowerCase(), name, price, createdAt: new Date().toISOString() }; }
function refund(chargeId, amount) { return { chargeId, amount, refundedAt:new Date().toISOString() }; }
function suspend(tenantId) { return { tenantId, status:'SUSPENDED', at:new Date().toISOString() }; }
function enforceQuota(usage, quota) { return usage < quota; }
module.exports = { createPlan, refund, suspend, enforceQuota };
