function applyHold(entity, reason) { return { ...entity, hold: true, reason }; }
function linkCapa(ncId, action) { return { ncId, action, createdAt: new Date().toISOString() }; }
function supplierScore(deliveryOnTimePct, defectsPerMillion) {
  const timeliness = deliveryOnTimePct; // 0..100
  const quality = Math.max(0, 100 - defectsPerMillion/1000);
  return Math.round((timeliness * 0.6) + (quality * 0.4));
}
module.exports = { applyHold, linkCapa, supplierScore };
