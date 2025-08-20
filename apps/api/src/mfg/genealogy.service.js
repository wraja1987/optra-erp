function buildGenealogy(relations = []) {
  const map = new Map();
  for (const { parentLot, childLot, qty } of relations) {
    const arr = map.get(childLot) || [];
    arr.push({ parentLot, qty });
    map.set(childLot, arr);
  }
  return map;
}

module.exports = { buildGenealogy };

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
