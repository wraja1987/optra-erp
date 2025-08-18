import { test, expect } from 'vitest';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { isBalanced, postJournal, setPeriod } = require('./journalService.js');

const linesBalanced = [
  { account: '1000', debit: 100 },
  { account: '2000', credit: 100 }
];

const linesUnbalanced = [
  { account: '1000', debit: 100 },
  { account: '2000', credit: 90 }
];

test('balanced check', () => {
  expect(isBalanced(linesBalanced)).toBe(true);
  expect(isBalanced(linesUnbalanced)).toBe(false);
});

test('period close blocks posting', () => {
  setPeriod('P1', 'CLOSED', false);
  expect(() => postJournal({ tenant_id: 't1', periodId: 'P1', lines: linesBalanced })).toThrow();
});

test('adjustment mode allowed when configured', () => {
  setPeriod('P2', 'CLOSED', true);
  const j = postJournal({ tenant_id: 't1', periodId: 'P2', lines: linesBalanced, adjustmentMode: true });
  expect(j.adjustmentMode).toBe(true);
});

test('intercompany journal has elimination draft', () => {
  setPeriod('P3', 'OPEN', false);
  const j = postJournal({ tenant_id: 't1', periodId: 'P3', lines: linesBalanced, intercompany: true });
  expect(j.elimination?.status).toBe('DRAFT');
});
