function backflush({ materials = [], outputQty = 0, scrapPct = 0, yieldPct = 100 }) {
  const consumed = materials.reduce((s, m) => s + Number(m.qty || 0), 0);
  const scrapFactor = 1 + (Number(scrapPct) || 0) / 100;
  const yieldFactor = (Number(yieldPct) || 100) / 100;
  const expected = (Number(outputQty) || 0) * scrapFactor / (yieldFactor || 1);
  const balanced = Math.abs(consumed - expected) < 1e-6 || consumed >= expected; // allow equal or slight over-consumption
  return { consumed, expected, balanced };
}

function blockCompletionOnHold(onHold) {
  if (onHold) throw new Error('Work order is on quality hold');
  return true;
}

module.exports = { backflush, blockCompletionOnHold };

function backflush({ materials, outputQty, scrapPct=0, yieldPct=100 }) {
  const effectiveQty = outputQty * (yieldPct/100);
  const scrap = outputQty * (scrapPct/100);
  const consumed = materials.map(m=>({ itemId: m.itemId, qty: +(m.qty * effectiveQty).toFixed(3) }));
  const totalIn = consumed.reduce((s,m)=>s+m.qty,0);
  const totalOut = +(effectiveQty + scrap).toFixed(3);
  const balanced = Math.abs(totalIn - totalOut) < 1e-3;
  return { consumed, balanced };
}
function blockCompletionOnHold(hold) { if (hold) throw new Error('Quality hold'); }
module.exports = { backflush, blockCompletionOnHold };
