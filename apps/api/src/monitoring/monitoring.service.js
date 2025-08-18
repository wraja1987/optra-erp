function monitor(apps) {
  return apps.map(a=>({ id:a.id, status:a.healthy? 'OK':'FAIL' }));
}
function killSwitch(apps, appId) { const a=apps.find(x=>x.id===appId); if (a) a.disabled=true; return a?true:false; }
function alertsFromStatuses(statuses) { return statuses.filter(s=>s.status!=='OK').map(s=>({ id:s.id, alert:'App failure' })); }
module.exports = { monitor, killSwitch, alertsFromStatuses };
