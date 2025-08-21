function applyRetainage(amount, retainPct) { return +(Number(amount) * (1 - Number(retainPct)/100)).toFixed(2); }
function milestoneTotal(amounts = []) { return +amounts.reduce((s,a)=>s+Number(a||0),0).toFixed(2); }
module.exports = { applyRetainage, milestoneTotal };
