export function cashForecast(inflows = [], outflows = []) {
  const inSum = inflows.reduce((s, v) => s + Number(v || 0), 0);
  const outSum = outflows.reduce((s, v) => s + Number(v || 0), 0);
  return inSum - outSum;
}

export function fxExposure(positions = []) {
  const byCcy = {};
  for (const p of positions) {
    byCcy[p.ccy] = (byCcy[p.ccy] || 0) + Number(p.amount || 0);
  }
  return byCcy;
}

export function intercompanyNetting(amounts = []) {
  const net = amounts.reduce((s, v) => s + Number(v || 0), 0);
  return { net };
}
