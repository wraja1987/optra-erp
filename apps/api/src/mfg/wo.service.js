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
