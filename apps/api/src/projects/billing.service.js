function applyRetainage(amount, percent) {
  return +(Number(amount) * (1 - Number(percent) / 100)).toFixed(2);
}

function milestoneTotal(amounts = []) {
  return amounts.reduce((s, v) => s + Number(v || 0), 0);
}

module.exports = { applyRetainage, milestoneTotal };

function applyRetainage(amount, retainPct) { return +(amount * (1 - retainPct/100)).toFixed(2); }
function milestoneTotal(amounts) { return +amounts.reduce((s,a)=>s+a,0).toFixed(2); }
module.exports = { applyRetainage, milestoneTotal };
