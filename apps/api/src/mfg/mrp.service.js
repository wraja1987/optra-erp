function planMRP(scheduledReceipts = [], demands = [], onHandLookup = {}) {
  const totalDemand = demands.reduce((s, d) => s + Number(d.qty || 0), 0);
  const totalReceipts = scheduledReceipts.reduce((s, r) => s + Number(r.qty || 0), 0);
  const plannedQty = Math.max(0, totalDemand - totalReceipts);
  const first = demands[0] || {};
  return plannedQty > 0 ? [{ itemId: first.itemId, plannedQty, due: first.needBy || null }] : [];
}

module.exports = { planMRP };

function planMRP(onHand, demand, leadDays) {
  const onHandMap = new Map(onHand.map(o=>[o.itemId, o.qty]));
  const plans = [];
  for (const d of demand) {
    const current = onHandMap.get(d.itemId) || 0;
    if (current >= d.qty) { onHandMap.set(d.itemId, current - d.qty); continue; }
    const short = d.qty - current;
    const lead = leadDays[d.itemId] ?? 0;
    const due = new Date(d.needBy); due.setDate(due.getDate() - lead);
    plans.push({ itemId: d.itemId, plannedQty: short, dueDate: due.toISOString().slice(0,10) });
    onHandMap.set(d.itemId, 0);
  }
  return plans;
}
module.exports = { planMRP };
