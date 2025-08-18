/* eslint-disable @typescript-eslint/no-var-requires */
const { assertSoD, enforceTenantScope, AiGovernanceDefaults, compileOpenApi } = require("../packages/core/src/index.js");

function ok(label) { console.log(`PASS: ${label}`); }
function fail(label, err) { console.error(`FAIL: ${label}: ${err?.message || err}`); process.exitCode = 1; }

(async () => {
  try {
    const ctxUser = { tenantId: "t1", userRole: "USER" };
    try { assertSoD(ctxUser, "CHANGE_SUBSCRIPTION"); fail("SoD block", new Error("not blocked")); } catch { ok("SoD block"); }

    const rec = { tenant_id: "t1", value: 1 };
    const rec2 = { tenant_id: "t2", value: 2 };
    if (!enforceTenantScope(ctxUser, rec) || enforceTenantScope(ctxUser, rec2)) { throw new Error("tenant scoping failed"); } else { ok("Tenant scoping"); }

    if (AiGovernanceDefaults.regulatedSubmit !== false) throw new Error("regulatedSubmit default"); else ok("AI defaults");

    if (!compileOpenApi()) throw new Error("openapi compile"); else ok("OpenAPI compiles");
  } catch (e) { fail("Gate checks", e); }
})();
