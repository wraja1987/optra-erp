function cashForecast(cashIn, cashOut) { const sum=(a)=>a.reduce((s,x)=>s+x,0); return sum(cashIn)-sum(cashOut); }
function fxExposure(positions) { return positions.reduce((s,p)=>{ s[p.ccy]=(s[p.ccy]||0)+p.amount; return s; },{}); }
function intercompanyNetting(balances) { const net=balances.reduce((s,b)=>s+b,0); return { net }; }
module.exports = { cashForecast, fxExposure, intercompanyNetting };
