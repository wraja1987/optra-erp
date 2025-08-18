function needsApproval(price, floor) { return price < floor; }
function applyDiscount(total, discountPct) { return +(total * (1 - discountPct/100)).toFixed(2); }
module.exports = { needsApproval, applyDiscount };
