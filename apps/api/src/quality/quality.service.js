function applyHold(entity, reason) {
  return { ...entity, hold: true, holdReason: reason };
}

function linkCapa(ncId, action) {
  return { ncId, action, createdAt: Date.now() };
}

function supplierScore(otdPercent, annualSpend) {
  const base = Number(otdPercent) || 0;
  const spendFactor = Math.log10(Math.max(1, Number(annualSpend) || 1));
  return +(Math.min(100, base * 0.8 + spendFactor * 10)).toFixed(2);
}

module.exports = { applyHold, linkCapa, supplierScore };

function applyHold(entity, reason) { return { ...entity, hold: true, reason }; }
function linkCapa(ncId, action) { return { ncId, action, createdAt: new Date().toISOString() }; }
function supplierScore(deliveryOnTimePct, defectsPerMillion) {
  const timeliness = deliveryOnTimePct; // 0..100
  const quality = Math.max(0, 100 - defectsPerMillion/1000);
  return Math.round((timeliness * 0.6) + (quality * 0.4));
}
module.exports = { applyHold, linkCapa, supplierScore };
