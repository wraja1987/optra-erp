function nlQuery(question) {
  // role-safe stub
  return { sql: 'SELECT 1', note: 'Role-safe NLQ stub' };
}
function schedulerRetry(statuses = []) {
  // returns true if a retry is needed
  return statuses.some(s=>s==='FAILED');
}
function odataList(entity) { return [{ id: '1', name: 'Demo' }]; }
module.exports = { nlQuery, schedulerRetry, odataList };
