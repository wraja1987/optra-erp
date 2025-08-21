function needsApproval(price, floor) { return Number(price) < Number(floor); }
function applyDiscount(total, discountPct) { return +(Number(total) * (1 - Number(discountPct)/100)).toFixed(2); }
module.exports = { needsApproval, applyDiscount };
