function buildGenealogy(moves) {
  // moves: [{parentLot, childLot, qty}]
  const graph = new Map();
  for (const m of moves) {
    if (!graph.has(m.childLot)) graph.set(m.childLot, []);
    graph.get(m.childLot).push({ parentLot: m.parentLot, qty: m.qty });
  }
  return graph;
}
module.exports = { buildGenealogy };
