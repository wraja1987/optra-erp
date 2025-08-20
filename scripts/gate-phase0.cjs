/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');
const { assertSoD, enforceTenantScope, AiGovernanceDefaults, compileOpenApi } = require("../packages/core/src/index.js");

function ok(label) { console.log(`PASS: ${label}`); }
function fail(label, err) { console.error(`FAIL: ${label}: ${err?.message || err}`); process.exitCode = 1; }

(async () => {
  try {
    // Monorepo scaffold present
    const root = process.cwd();
    if (!fs.existsSync(path.join(root, 'pnpm-workspace.yaml'))) throw new Error('pnpm-workspace missing');
    if (!fs.existsSync(path.join(root, 'packages'))) throw new Error('packages/ missing');
    ok('Monorepo scaffold');

    // Prisma schema valid
    try { execSync('pnpm -w prisma:validate', { stdio: 'ignore' }); ok('Prisma schema valid'); } catch (e) { throw new Error('prisma validate failed'); }

    // CI pipeline present
    if (!fs.existsSync(path.join(root, '.github', 'workflows', 'ci.yml'))) throw new Error('CI workflow missing');
    ok('CI pipeline');

    // Accessibility lint configured (placeholder script exists)
    const pkg = JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
    if (!pkg.scripts || !pkg.scripts.a11y) throw new Error('a11y script missing');
    ok('Accessibility lint configured');

    // AI governance defaults and compile
    const ctxUser = { tenantId: "t1", userRole: "USER" };
    try { assertSoD(ctxUser, "CHANGE_SUBSCRIPTION"); fail("SoD block", new Error("not blocked")); } catch { ok("SoD block"); }

    const rec = { tenant_id: "t1", value: 1 };
    const rec2 = { tenant_id: "t2", value: 2 };
    if (!enforceTenantScope(ctxUser, rec) || enforceTenantScope(ctxUser, rec2)) { throw new Error("tenant scoping failed"); } else { ok("Tenant scoping"); }

    if (AiGovernanceDefaults.regulatedSubmit !== false) throw new Error("regulatedSubmit default"); else ok("AI defaults");
    if (!compileOpenApi()) throw new Error("openapi compile"); else ok("OpenAPI compiles");

    // Typecheck and tests
    try { execSync('pnpm -w typecheck', { stdio: 'ignore' }); ok('Typecheck'); } catch { throw new Error('typecheck failed'); }
    try { execSync('pnpm -w test', { stdio: 'ignore' }); ok('Unit tests'); } catch { throw new Error('tests failed'); }
  } catch (e) { fail("Phase 0", e); }
})();
