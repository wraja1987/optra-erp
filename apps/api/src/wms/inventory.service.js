function selectFEFO(lots, requiredQty) {
  const candidates = (lots || []).filter(l => !l.quarantine).sort((a, b) => new Date(a.expiry) - new Date(b.expiry));
  let remaining = requiredQty || 0;
  const tasks = [];
  for (const lot of candidates) {
    if (remaining <= 0) break;
    const pickQty = Math.min(lot.qty || 0, remaining);
    if (pickQty > 0) {
      tasks.push({ lotId: lot.id, qty: pickQty });
      remaining -= pickQty;
    }
  }
  return tasks;
}

function autoPutaway(binPreferredItemMap, itemId) {
  const entries = Object.entries(binPreferredItemMap || {});
  const found = entries.find(([bin, pref]) => pref === itemId);
  if (found) return found[0];
  return entries[0]?.[0] || null;
}

function shouldReplenish(currentQty, minQty) {
  return Number(currentQty) < Number(minQty);
}

module.exports = { selectFEFO, autoPutaway, shouldReplenish };

function selectFEFO(lots, qty) {
  const eligible = lots.filter(l => !l.quarantine && l.qty > 0).sort((a,b)=> new Date(a.expiry) - new Date(b.expiry));
  const tasks = [];
  let remaining = qty;
  for (const lot of eligible) {
    if (remaining <= 0) break;
    const take = Math.min(lot.qty, remaining);
    tasks.push({ lotId: lot.id, qty: take });
    remaining -= take;
  }
  if (remaining > 0) throw new Error('Insufficient stock');
  return tasks;
}
function autoPutaway(binClassMap, itemClass) {
  const found = Object.entries(binClassMap).find(([, cls])=>cls===itemClass);
  if (!found) throw new Error('No matching bin class');
  return found[0];
}
function shouldReplenish(onHand, minLevel) { return onHand < minLevel; }
module.exports = { selectFEFO, autoPutaway, shouldReplenish };
