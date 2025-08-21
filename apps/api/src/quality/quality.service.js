export function applyHold(entity, reason) {
  return { ...entity, hold: true, holdReason: reason };
}

export function linkCapa(ncId, action) {
  return { ncId, action, createdAt: new Date().toISOString() };
}

export function supplierScore(deliveryOnTimePct, defectsPerMillion) {
  const timeliness = Number(deliveryOnTimePct) || 0; // 0..100
  const quality = Math.max(0, 100 - (Number(defectsPerMillion) || 0) / 1000);
  return Math.round((timeliness * 0.6) + (quality * 0.4));
}
