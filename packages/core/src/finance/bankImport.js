// Simple CSV bank import and auto-match by amount/date/reference
function parseCsv(text) {
  const [headerLine, ...rows] = text.trim().split(/\r?\n/);
  const headers = headerLine.split(',').map(h => h.trim());
  return rows.map(r => {
    const cols = r.split(',').map(c => c.trim());
    return Object.fromEntries(headers.map((h, i) => [h, cols[i] ?? '']));
  });
}

function autoMatch(transactions, invoices) {
  let matched = 0;
  const matches = [];
  for (const t of transactions) {
    const amount = Number(t.amount);
    const ref = (t.reference || '').toLowerCase();
    const candidate = invoices.find(inv => Math.abs(Number(inv.amount) - Math.abs(amount)) < 0.001 && (ref.includes(inv.number.toLowerCase()) || ref.includes(inv.customer.toLowerCase())));
    if (candidate) { matched++; matches.push({ transaction: t, invoice: candidate }); }
  }
  const rate = transactions.length ? matched / transactions.length : 0;
  return { matches, rate };
}

module.exports = { parseCsv, autoMatch };
