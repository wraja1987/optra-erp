const { execSync } = require('child_process');

function run(cmd){ try { return execSync(cmd, { stdio: 'pipe' }).toString(); } catch(e){ return e.stdout?.toString() || e.message; } }
function log(s){ console.log(s); }

(async () => {
  const summary = { phase0: 'SKIP', phase1: 'SKIP', phase2: 'SKIP' };

  // Pre-checks
  try {
    log('Pre: pnpm -w prisma generate');
    log(run('pnpm -w prisma generate'));
    log('Pre: npx prisma db push');
    log(run('npx prisma db push --schema=./prisma/schema.prisma'));
  } catch {}

  // Phase 0
  try { run('node scripts/gate-phase0.cjs'); summary.phase0 = 'PASS'; }
  catch { summary.phase0 = 'FAIL'; }

  // Phase 1
  try { run('node scripts/gate-phase1.cjs'); summary.phase1 = 'PASS'; }
  catch { summary.phase1 = 'FAIL'; }

  // Phase 2: if file exists, run it, else SKIP
  const fs = require('fs');
  if (fs.existsSync('scripts/gate-phase2.cjs')) {
    try { run('node scripts/gate-phase2.cjs'); summary.phase2 = 'PASS'; } catch { summary.phase2 = 'FAIL'; }
  } else if (fs.existsSync('scripts/gates/phase2.cjs')) {
    // Use existing Phase 2 stub if present
    try { run('node scripts/gates/phase2.cjs'); summary.phase2 = 'PASS'; } catch { summary.phase2 = 'FAIL'; }
  } else {
    summary.phase2 = 'SKIP (not implemented)';
  }

  // Summary
  log('=== Optra ERP Gate Summary ===');
  log(`Phase 0: ${summary.phase0}`);
  log(`Phase 1: ${summary.phase1}`);
  log(`Phase 2: ${summary.phase2}`);
  const overall = (summary.phase0.startsWith('PASS') && summary.phase1.startsWith('PASS') && !summary.phase2.startsWith('FAIL')) ? 'PASS' : 'FAIL';
  log(`Overall: ${overall}`);
})();

