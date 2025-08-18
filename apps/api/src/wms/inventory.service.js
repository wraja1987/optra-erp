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
