import { test, expect } from 'vitest';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { parseCsv, autoMatch } = require('./bankImport.js');

test('csv parse', () => {
  const csv = 'date,amount,reference\n2024-01-01,100.00,INV-001 John';
  const rows = parseCsv(csv);
  expect(rows[0].date).toBe('2024-01-01');
  expect(rows[0].amount).toBe('100.00');
});

test('auto-match >= 80%', () => {
  const csv = [
    'date,amount,reference',
    '2024-01-01,100.00,INV-001 John',
    '2024-01-02,200.00,INV-002 Jane',
    '2024-01-03,300.00,INV-003 ACME',
    '2024-01-04,400.00,INV-004 Foo',
    '2024-01-05,500.00,INV-XXX Miss\n'
  ].join('\n');
  const txns = parseCsv(csv);
  const invoices = [
    { number: 'INV-001', amount: 100, customer: 'john' },
    { number: 'INV-002', amount: 200, customer: 'jane' },
    { number: 'INV-003', amount: 300, customer: 'acme' },
    { number: 'INV-004', amount: 400, customer: 'foo' },
    { number: 'INV-999', amount: 999, customer: 'none' }
  ];
  const { rate } = autoMatch(txns, invoices);
  expect(rate).toBeGreaterThanOrEqual(0.8);
});
