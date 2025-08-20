function nlQuery(prompt) {
  return { sql: `SELECT * FROM sales WHERE month = 'last' /* ${String(prompt)} */` };
}

function schedulerRetry(statuses = []) {
  // retry until success, stop if permanent failure pattern; simplified to return true if any FAILED followed by OK
  let seenFailed = false;
  for (const s of statuses) {
    if (s === 'FAILED') seenFailed = true;
    if (seenFailed && s === 'OK') return true;
  }
  return false;
}

function odataList(entitySet) {
  return [{ id: 1, name: 'Sample' }];
}

module.exports = { nlQuery, schedulerRetry, odataList };

function nlQuery(question) {
  // role-safe stub
  return { sql: 'SELECT 1', note: 'Role-safe NLQ stub' };
}
function schedulerRetry(statuses) {
  // returns true if a retry is needed
  return statuses.some(s=>s==='FAILED');
}
function odataList(entity) { return [{ id: '1', name: 'Demo' }]; }
module.exports = { nlQuery, schedulerRetry, odataList };
