function needsApproval(price, floor) {
  return Number(price) < Number(floor);
}

function applyDiscount(amount, percent) {
  const val = Number(amount) * (1 - Number(percent) / 100);
  return +val.toFixed(2);
}

module.exports = { needsApproval, applyDiscount };

function needsApproval(price, floor) { return price < floor; }
function applyDiscount(total, discountPct) { return +(total * (1 - discountPct/100)).toFixed(2); }
module.exports = { needsApproval, applyDiscount };
