// Minimal double-entry journal posting with period controls and intercompany elimination stubs
const PERIODS = new Map(); // periodId -> { status: 'OPEN'|'CLOSED', allowAdjustments: boolean }

function isBalanced(lines) {
  const total = lines.reduce((sum, l) => sum + (l.debit || 0) - (l.credit || 0), 0);
  return Math.abs(total) < 1e-6;
}

function assertPeriodOpen(periodId, { adjustmentMode = false } = {}) {
  const period = PERIODS.get(periodId) || { status: 'OPEN', allowAdjustments: false };
  if (period.status === 'CLOSED' && !adjustmentMode) {
    throw new Error('Period is closed');
  }
  if (period.status === 'CLOSED' && adjustmentMode && !period.allowAdjustments) {
    throw new Error('Adjustment mode not allowed');
  }
}

function setPeriod(periodId, status, allowAdjustments = false) {
  PERIODS.set(periodId, { status, allowAdjustments });
}

function postJournal({ tenant_id, periodId, lines, intercompany = false, adjustmentMode = false }) {
  if (!tenant_id) throw new Error('tenant_id required');
  if (!Array.isArray(lines) || lines.length === 0) throw new Error('lines required');
  assertPeriodOpen(periodId, { adjustmentMode });
  if (!isBalanced(lines)) throw new Error('Unbalanced journal');

  const posted = { tenant_id, periodId, lines, intercompany, adjustmentMode, postedAt: new Date().toISOString() };
  if (intercompany) {
    posted.elimination = { status: 'DRAFT', note: 'Elimination to be processed during consolidation.' };
  }
  return posted;
}

module.exports = { isBalanced, postJournal, setPeriod };
