function searchApps(apps = [], query = '') {
  const q = String(query).toLowerCase();
  return apps.filter(a => a.name.toLowerCase().includes(q) || (a.category || '').toLowerCase().includes(q));
}

function installApp(registry, app) {
  registry.set(app.id, { ...app, installedAt: Date.now() });
  return true;
}

function uninstallApp(registry, appId) {
  registry.delete(appId);
  return true;
}

function listInstalled(registry) {
  return Array.from(registry.values());
}

module.exports = { searchApps, installApp, uninstallApp, listInstalled };

function searchApps(apps, query) { const q=(query||'').toLowerCase(); return apps.filter(a=>a.name.toLowerCase().includes(q) || (a.category||'').toLowerCase().includes(q)); }
function installApp(registry, app) { registry.set(app.id, { ...app, installed:true, installedAt:new Date().toISOString() }); return true; }
function uninstallApp(registry, appId) { const a=registry.get(appId); if (!a) return false; registry.delete(appId); return true; }
function listInstalled(registry) { return Array.from(registry.values()); }
module.exports = { searchApps, installApp, uninstallApp, listInstalled };
