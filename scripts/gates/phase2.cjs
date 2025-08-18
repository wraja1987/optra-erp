const { selectFEFO, autoPutaway, shouldReplenish } = require('../../apps/api/src/wms/inventory.service.js');
const { planMRP } = require('../../apps/api/src/mfg/mrp.service.js');
const { backflush, blockCompletionOnHold } = require('../../apps/api/src/mfg/wo.service.js');
const { needsApproval, applyDiscount } = require('../../apps/api/src/crm/cpq.service.js');
const { evidenceHash } = require('../../apps/api/src/clm/contracts.service.js');
const { applyRetainage, milestoneTotal } = require('../../apps/api/src/projects/billing.service.js');
const { createSignedLink, isLinkValid } = require('../../apps/api/src/analytics/scheduler.service.js');

function ok(label){ console.log(`PASS: ${label}`); }
function fail(label, err){ console.error(`FAIL: ${label}: ${err?.message||err}`); process.exitCode = 1; }

(async () => {
  try {
    // WMS FEFO + quarantine
    const lots = [
      { id:'L1', itemId:'A', expiry:'2024-01-01', qty:5 },
      { id:'L2', itemId:'A', expiry:'2023-12-31', qty:5 },
      { id:'L3', itemId:'A', expiry:'2023-12-15', qty:5, quarantine:true }
    ];
    const tasks = selectFEFO(lots, 8);
    if (tasks[0].lotId !== 'L2') throw new Error('FEFO wrong');
    ok('WMS FEFO');

    const bin = autoPutaway({ B1:'A', B2:'B' }, 'A');
    if (bin !== 'B1') throw new Error('putaway');
    ok('WMS putaway');

    if (!shouldReplenish(5,10)) throw new Error('replen');
    ok('WMS replenishment trigger');

    // MFG MRP + backflush + quality hold
    const plans = planMRP([{itemId:'A',qty:2}], [{itemId:'A',qty:10,needBy:'2024-01-10'}], { A: 3 });
    if (!plans.length || plans[0].plannedQty !== 8) throw new Error('mrp');
    ok('MRP planned orders');

    const bf = backflush({ materials:[{itemId:'M1',qty:1}], outputQty:1, scrapPct:0, yieldPct:100 });
    if (!bf.balanced) throw new Error('backflush');
    ok('WO backflush');

    try { blockCompletionOnHold(true); fail('Quality hold block','not blocked'); } catch { ok('Quality hold block'); }

    // CRM/CPQ and CLM
    if (!needsApproval(90,100)) throw new Error('price floor');
    if (applyDiscount(100,10) !== 90) throw new Error('discount');
    ok('CPQ rules');

    const ev = evidenceHash({ contractId:'C1', terms:['a'] });
    if (!ev.hash || !ev.timestamp) throw new Error('evidence');
    ok('Contract evidence');

    // Projects
    if (applyRetainage(1000,10) !== 900) throw new Error('retainage');
    if (milestoneTotal([100,200,300]) !== 600) throw new Error('milestone total');
    ok('Projects billing');

    // Analytics
    const link = createSignedLink('R1', 2);
    const now = Math.floor(Date.now()/1000);
    if (!isLinkValid(link, now)) throw new Error('link invalid early');
    const expired = { ...link, expiresAt: now - 1 };
    if (isLinkValid(expired, now)) throw new Error('link not expired');
    ok('Analytics signed links');
  } catch(e) { fail('Phase2 gates', e); }
})();
