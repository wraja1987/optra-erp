function createOfflineChecklist(jobId) {
  return { jobId, items: [], status: 'DRAFT' };
}

function addItem(checklist, text) {
  return { ...checklist, items: [...(checklist.items || []), { text, done: false }] };
}

function complete(checklist, signedBy) {
  return { ...checklist, status: 'DONE', signedBy };
}

function slaTimer(startIso, minutes) {
  const start = new Date(startIso).getTime();
  const end = start + Number(minutes) * 60 * 1000;
  return end;
}

module.exports = { createOfflineChecklist, addItem, complete, slaTimer };

function createOfflineChecklist(jobId) { return { jobId, items: [], offline: true, status: 'OPEN' }; }
function addItem(list, text) { list.items.push({ text, done:false }); return list; }
function complete(list, signedBy) { return { ...list, status:'DONE', signedBy, signedAt: new Date().toISOString(), offline:false }; }
function slaTimer(startIso, mins) { return new Date(new Date(startIso).getTime() + mins*60000).toISOString(); }
module.exports = { createOfflineChecklist, addItem, complete, slaTimer };
