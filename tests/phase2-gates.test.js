import { describe, it, expect } from 'vitest';
import * as Inv from '../apps/api/src/wms/inventory.service.js';
import { planMRP } from '../apps/api/src/mfg/mrp.service.js';
import { backflush, blockCompletionOnHold } from '../apps/api/src/mfg/wo.service.js';
import { needsApproval, applyDiscount } from '../apps/api/src/crm/cpq.service.js';
import { evidenceHash } from '../apps/api/src/clm/contracts.service.js';
import { applyRetainage, milestoneTotal } from '../apps/api/src/projects/billing.service.js';
import { createSignedLink, isLinkValid } from '../apps/api/src/analytics/scheduler.service.js';

describe('Phase2 service behaviours', () => {
  it('WMS FEFO, putaway, replenish', () => {
    const lots = [
      { id:'L1', itemId:'A', expiry:'2024-01-01', qty:5 },
      { id:'L2', itemId:'A', expiry:'2023-12-31', qty:5 },
      { id:'L3', itemId:'A', expiry:'2023-12-15', qty:5, quarantine:true }
    ];
    const tasks = Inv.selectFEFO(lots, 8);
    expect(tasks[0].lotId).toBe('L2');
    expect(Inv.autoPutaway({ B1:'A', B2:'B' }, 'A')).toBe('B1');
    expect(Inv.shouldReplenish(5,10)).toBe(true);
  });

  it('MRP & WO', () => {
    const plans = planMRP([{itemId:'A',qty:2}], [{itemId:'A',qty:10,needBy:'2024-01-10'}], { A: 3 });
    expect(plans[0].plannedQty).toBe(8);
    const bf = backflush({ materials:[{itemId:'M1',qty:1}], outputQty:1, scrapPct:0, yieldPct:100 });
    expect(bf.balanced).toBe(true);
    expect(() => blockCompletionOnHold(true)).toThrow();
  });

  it('CPQ, CLM, Projects', () => {
    expect(needsApproval(90,100)).toBe(true);
    expect(applyDiscount(100,10)).toBe(90);
    const ev = evidenceHash({ contractId:'C1', terms:['a'] });
    expect(ev.hash).toBeTruthy();
    expect(applyRetainage(1000,10)).toBe(900);
    expect(milestoneTotal([100,200,300])).toBe(600);
  });

  it('Analytics signed links', () => {
    const link = createSignedLink('R1', 2);
    const now = Math.floor(Date.now()/1000);
    expect(isLinkValid(link, now)).toBe(true);
    const expired = { ...link, expiresAt: now - 1 };
    expect(isLinkValid(expired, now)).toBe(false);
  });
});


