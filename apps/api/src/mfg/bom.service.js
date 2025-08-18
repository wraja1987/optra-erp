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
