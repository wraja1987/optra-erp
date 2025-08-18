const { expandBom, effectiveBom } = require('../../apps/api/src/mfg/bom.service.js');
const { planMRP } = require('../../apps/api/src/mfg/mrp.service.js');
const { backflush } = require('../../apps/api/src/mfg/wo.service.js');
const { buildGenealogy } = require('../../apps/api/src/mfg/genealogy.service.js');
const { applyHold, linkCapa, supplierScore } = require('../../apps/api/src/quality/quality.service.js');
const { createOfflineChecklist, addItem, complete, slaTimer } = require('../../apps/api/src/fieldservice/checklist.service.js');
const { cashForecast, fxExposure, intercompanyNetting } = require('../../apps/api/src/treasury/treasury.service.js');
const { nlQuery, schedulerRetry, odataList } = require('../../apps/api/src/analytics/nlq.service.js');
const { validateManifest, signWebhook, verifyWebhook, install, uninstall, skillRegistryEntry } = require('../../apps/api/src/marketplace/manifest.service.js');

function ok(label){ console.log(`PASS: ${label}`); }
function fail(label, err){ console.error(`FAIL: ${label}: ${err?.message||err}`); process.exitCode = 1; }

(async () => {
  try {
    // Manufacturing
    const versions = [ { itemId:'P1', version:'A', effectiveFrom:'2024-01-01' }, { itemId:'P1', version:'B', effectiveFrom:'2024-06-01' } ];
    const eff = effectiveBom(versions, 'P1', '2024-07-01'); if (eff.version!=='B') throw new Error('bom version'); ok('BOM versioning');
    const items = expandBom([{ bomVersionId:'BV1', componentId:'C1', qty:2 }, { bomVersionId:'BV1', componentId:'C2', qty:1, subVersionId:'BV2' }, { bomVersionId:'BV2', componentId:'C3', qty:3 }], 'BV1'); if (items.length!==3) throw new Error('bom expand'); ok('BOM multi-level');
    const plans = planMRP([{itemId:'P1',qty:5}], [{itemId:'P1',qty:20,needBy:'2024-01-20'}], { P1: 5 }); if (!plans.length) throw new Error('mrp'); ok('MRP planned orders');
    const bf = backflush({ materials:[{itemId:'C1',qty:1}], outputQty:1, scrapPct:0, yieldPct:100 }); if (!bf.balanced) throw new Error('backflush'); ok('WO backflush');
    const genealogy = buildGenealogy([{parentLot:'L1',childLot:'L2',qty:1}]); if (!Array.isArray(genealogy.get('L2'))) throw new Error('genealogy'); ok('Lot genealogy');

    // Quality
    const held = applyHold({ id:'WO1' }, 'QC'); if (!held.hold) throw new Error('hold'); const capa = linkCapa('NC1','investigate'); if (!capa.ncId) throw new Error('capa'); ok('Quality hold + CAPA');
    const score = supplierScore(95, 3000); if (isNaN(score)) throw new Error('supplier score'); ok('Supplier scoring');

    // Projects & Field Service
    let cl = createOfflineChecklist('J1'); cl = addItem(cl,'Check oil'); cl = complete(cl,'Customer'); if (cl.status!=='DONE' || !cl.signedBy) throw new Error('checklist'); const sla = slaTimer('2024-01-01T00:00:00Z', 30); if (!sla) throw new Error('sla'); ok('Field service checklist/SLA/sign-off');

    // Treasury & Risk
    if (cashForecast([100,200],[50]) !== 250) throw new Error('cash'); const fx = fxExposure([{ccy:'USD',amount:100},{ccy:'USD',amount:-20}]); if (fx.USD!==80) throw new Error('fx'); if (!('net' in intercompanyNetting([100,-100]))) throw new Error('net'); ok('Treasury');

    // Analytics
    const nl = nlQuery('sales last month'); if (!nl.sql) throw new Error('nlq'); if (!schedulerRetry(['OK','FAILED']) ) throw new Error('retry'); if (!odataList('accounts').length) throw new Error('odata'); ok('Analytics NLQ/scheduler/OData');

    // Marketplace Core
    const manifest = { name:'demo', oauthScopes:['read:accounts'] }; if (!validateManifest(manifest)) throw new Error('manifest');
    const payload = { event:'installed' }; const secret='s3cr3t'; const nonce='abc'; const sig = signWebhook(payload, secret, nonce); if (!verifyWebhook(payload, secret, nonce, sig)) throw new Error('hmac');
    if (!install('app1',['ent:read'])) throw new Error('install'); if (!uninstall('app1')) throw new Error('uninstall'); const skill = skillRegistryEntry('quote-drafter', 4000); if (!skill.confirmCard || skill.tokenCap<=0) throw new Error('skill');
    ok('Marketplace core');
  } catch(e) { fail('Phase3 gates', e); }
})();
