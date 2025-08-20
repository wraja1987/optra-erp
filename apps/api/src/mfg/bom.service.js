function effectiveBom(versions = [], itemId, onDate) {
  const date = new Date(onDate || Date.now());
  const filtered = versions.filter(v => v.itemId === itemId && new Date(v.effectiveFrom) <= date);
  filtered.sort((a, b) => new Date(a.effectiveFrom) - new Date(b.effectiveFrom));
  return filtered[filtered.length - 1] || null;
}

function expandBom(components = [], rootVersionId) {
  const result = [];
  const visited = new Set();
  function walk(versionId) {
    const rows = components.filter(c => c.bomVersionId === versionId);
    for (const row of rows) {
      const key = `${row.componentId}`;
      if (!visited.has(key)) {
        visited.add(key);
        result.push({ componentId: row.componentId, qty: row.qty });
      }
      if (row.subVersionId) walk(row.subVersionId);
    }
  }
  walk(rootVersionId);
  return result;
}

module.exports = { effectiveBom, expandBom };

function expandBom(boms, rootVersionId) {
  const items = [];
  function dfs(versionId, factor) {
    const lines = boms.filter(b=>b.bomVersionId===versionId);
    for (const l of lines) {
      items.push({ componentId: l.componentId, qty: l.qty * factor });
      if (l.subVersionId) dfs(l.subVersionId, factor * l.qty);
    }
  }
  dfs(rootVersionId, 1);
  return items;
}
function effectiveBom(versions, itemId, atIso) {
  const at = new Date(atIso);
  const v = versions.filter(v=>v.itemId===itemId && new Date(v.effectiveFrom)<=at && (!v.effectiveTo || new Date(v.effectiveTo)>at)).sort((a,b)=>a.version.localeCompare(b.version)).pop();
  if (!v) throw new Error('No effective BOM');
  return v;
}
module.exports = { expandBom, effectiveBom };
