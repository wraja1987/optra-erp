const { isBalanced, postJournal, setPeriod } = require('../packages/core/src/finance/journalService.js');
const { parseCsv, autoMatch } = require('../packages/core/src/finance/bankImport.js');
const { buildPayrollJournal, autoEnrolmentAssessment } = require('../packages/core/src/payroll/payrollEngine.js');

function ok(label){ console.log(`PASS: ${label}`); }
function fail(label, err){ console.error(`FAIL: ${label}: ${err?.message||err}`); process.exitCode = 1; }

(async () => {
  try {
    const balanced = [ {account:'1000',debit:100}, {account:'2000',credit:100} ];
    if (!isBalanced(balanced)) throw new Error('balanced check failed');
    ok('Double-entry');

    setPeriod('P1','CLOSED',false);
    try { postJournal({ tenant_id:'t1', periodId:'P1', lines: balanced }); fail('Period close block', 'not blocked'); } catch { ok('Period close block'); }
    setPeriod('P2','CLOSED',true);
    postJournal({ tenant_id:'t1', periodId:'P2', lines: balanced, adjustmentMode:true });
    ok('Adjustment mode');

    setPeriod('P3','OPEN',false);
    const j = postJournal({ tenant_id:'t1', periodId:'P3', lines: balanced, intercompany:true });
    if (!j.elimination || j.elimination.status!=='DRAFT') throw new Error('elimination missing');
    ok('Intercompany elimination');

    const csv = [ 'date,amount,reference', '2024-01-01,100.00,INV-001 John', '2024-01-02,200.00,INV-002 Jane', '2024-01-03,300.00,INV-003 ACME', '2024-01-04,400.00,INV-004 Foo', '2024-01-05,500.00,INV-XXX Miss' ].join('\n');
    const txns = parseCsv(csv);
    const invoices = [ {number:'INV-001', amount:100, customer:'john'}, {number:'INV-002', amount:200, customer:'jane'}, {number:'INV-003', amount:300, customer:'acme'}, {number:'INV-004', amount:400, customer:'foo'} ];
    const { rate } = autoMatch(txns, invoices);
    if (rate < 0.8) throw new Error(`match rate ${rate}`);
    ok('Bank auto-match >=80%');

    const pj = buildPayrollJournal({ tenant_id:'t1', periodId:'P9', gross:1000, paye:200, ni:60 });
    const sum = pj.lines.reduce((s,l)=>s+(l.debit||0)-(l.credit||0),0);
    if (Math.abs(sum) > 1e-6) throw new Error('payroll journal unbalanced');
    if (!autoEnrolmentAssessment(30,20000).eligible) throw new Error('AE failed');
    ok('Payroll journals + AE');

  } catch(e) { fail('Phase1 gates', e); }
})();
