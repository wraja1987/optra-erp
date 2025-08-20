function cashForecast(inflows = [], outflows = []) {
  const inSum = inflows.reduce((s, v) => s + Number(v || 0), 0);
  const outSum = outflows.reduce((s, v) => s + Number(v || 0), 0);
  return inSum - outSum;
}

function fxExposure(positions = []) {
  const byCcy = {};
  for (const p of positions) {
    byCcy[p.ccy] = (byCcy[p.ccy] || 0) + Number(p.amount || 0);
  }
  return byCcy;
}

function intercompanyNetting(amounts = []) {
  const net = amounts.reduce((s, v) => s + Number(v || 0), 0);
  return { net };
}

module.exports = { cashForecast, fxExposure, intercompanyNetting };

function cashForecast(cashIn, cashOut) { const sum=(a)=>a.reduce((s,x)=>s+x,0); return sum(cashIn)-sum(cashOut); }
function fxExposure(positions) { return positions.reduce((s,p)=>{ s[p.ccy]=(s[p.ccy]||0)+p.amount; return s; },{}); }
function intercompanyNetting(balances) { const net=balances.reduce((s,b)=>s+b,0); return { net }; }
module.exports = { cashForecast, fxExposure, intercompanyNetting };
