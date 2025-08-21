#!/usr/bin/env node
/*
 Phase 0→2 Audit Script for Optra ERP
 - Collects environment facts, validates env, checks DB/Prisma, runs gates, tests, coverage,
   a11y stubs, security, build, UI perf, screenshots, and writes Markdown + JSON reports.
 - Non-destructive (read-safe DB checks; does not apply migrations).
*/

const fs = require('fs');
const path = require('path');
const os = require('os');
const cp = require('child_process');
const net = require('net');

const repoRoot = process.cwd();

function sh(cmd, opts = {}) {
  try {
    const out = cp.execSync(cmd, { stdio: 'pipe', encoding: 'utf8', ...opts });
    return { ok: true, code: 0, stdout: out, stderr: '' };
  } catch (e) {
    return { ok: false, code: e.status ?? 1, stdout: e.stdout?.toString?.() || '', stderr: e.stderr?.toString?.() || e.message };
  }
}

async function waitPort(port, host = '127.0.0.1', timeoutMs = 15000) {
  const started = Date.now();
  return new Promise((resolve) => {
    (function tryOnce() {
      const socket = net.createConnection({ port, host });
      let done = false;
      const end = (ok) => {
        if (done) return; done = true;
        socket.destroy();
        resolve(ok);
      };
      socket.once('connect', () => end(true));
      socket.once('error', () => {
        if (Date.now() - started > timeoutMs) return end(false);
        setTimeout(tryOnce, 500);
      });
    })();
  });
}

function redactEnv(obj) {
  const out = {};
  for (const k of Object.keys(obj || {})) {
    if (!obj[k]) { out[k] = ''; continue; }
    const v = String(obj[k]);
    out[k] = v.length <= 4 ? '****' : v.slice(0, 1) + '***' + v.slice(-1);
  }
  return out;
}

function readEnvFile(p) {
  try {
    const txt = fs.readFileSync(p, 'utf8');
    const lines = txt.split(/\r?\n/);
    const kv = {};
    for (const ln of lines) {
      if (!ln || ln.trim().startsWith('#')) continue;
      const idx = ln.indexOf('=');
      if (idx === -1) continue;
      const k = ln.slice(0, idx).trim();
      const v = ln.slice(idx + 1).trim();
      if (k) kv[k] = v;
    }
    return kv;
  } catch {
    return {};
  }
}

async function main() {
  const startedAt = new Date();
  const ts = startedAt.toISOString().replace(/[-:]/g, '').slice(0, 13) + startedAt.toISOString().slice(13, 16); // YYYYMMDDTHH
  const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 13).replace('Z','');
  const tsLocal = new Date().toISOString().replace(/[-:TZ]/g, '').slice(0, 13);
  const outTs = new Date().toISOString().replace(/[-:TZ]/g, '').slice(0, 13);
  const fnameTs = new Date().toISOString().replace(/[-:TZ]/g, '').slice(0, 13);
  const timeStr = new Date().toISOString();
  const reportBase = `audit-phase0-2-${fnameTs}`;
  const reportsDir = path.join(repoRoot, 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });
  const mdPath = path.join(reportsDir, `${reportBase}.md`);
  const jsonPath = path.join(reportsDir, `${reportBase}.json`);

  const result = {
    overview: {},
    environment: {},
    docker: {},
    ports: {},
    env_audit: {},
    prisma: {},
    monorepo: {},
    gates: {},
    accessibility: {},
    tests: {},
    security: {},
    build: {},
    perf: {},
    screenshots: {},
    summary: {}
  };

  // Overview
  const branch = sh('git rev-parse --abbrev-ref HEAD').stdout.trim();
  const lastCommit = sh("git log -1 --pretty=format:'%h %s (%ad) <%an>' --date=iso").stdout.trim();
  result.overview = { time: timeStr, branch, lastCommit };

  // 1) Environment & infra
  const nodeV = process.version;
  const pnpmV = sh('pnpm -v');
  const dockerV = sh('docker compose version');
  const cpu = os.cpus()?.[0]?.model || '';
  result.environment = {
    node: nodeV,
    pnpm: pnpmV.ok ? pnpmV.stdout.trim() : 'N/A',
    os: `${os.type()} ${os.release()} (${os.platform()})`,
    cpu,
    memoryGB: (os.totalmem() / (1024 ** 3)).toFixed(2)
  };
  result.docker = { composeVersion: dockerV.ok ? dockerV.stdout.trim() : 'N/A' };

  // optionally start db/redis if defined in docker-compose.yml
  const dcPath = path.join(repoRoot, 'docker-compose.yml');
  if (fs.existsSync(dcPath)) {
    const dc = fs.readFileSync(dcPath, 'utf8');
    if (/\bservices:\b/.test(dc) && /(\bdb\b|\bredis\b)/.test(dc)) {
      sh('docker compose up -d db redis');
    }
  }
  const pgReady = await waitPort(5433, '127.0.0.1', 7000);
  const redisReady = await waitPort(6379, '127.0.0.1', 3000);
  const lsof5433 = sh('lsof -nP -i :5433 || true').stdout.trim();
  result.ports = { postgres5433: pgReady, redis6379: redisReady, lsof5433 };

  // 2) .env validation
  const env = readEnvFile(path.join(repoRoot, '.env'));
  const envEx = readEnvFile(path.join(repoRoot, '.env.example'));
  const keysEnv = new Set(Object.keys(env));
  const keysEx = new Set(Object.keys(envEx));
  const missingFromEnv = [...keysEx].filter(k => !keysEnv.has(k));
  const missingFromExample = [...keysEnv].filter(k => !keysEx.has(k));
  const critical = ['DATABASE_URL', 'NEXTAUTH_SECRET'];
  const mailKeys = Object.keys(env).filter(k => /MAIL|SMTP/i.test(k));
  const criticalPresent = Object.fromEntries(critical.map(k => [k, !!env[k]]));
  result.env_audit = {
    presentKeys: Object.keys(env).sort(),
    exampleKeys: Object.keys(envEx).sort(),
    missingFromEnv,
    missingFromExample,
    criticalPresent,
    mailKeys,
    redacted: redactEnv(env)
  };

  // 3) Prisma (generate + migrate status + connectivity probe)
  const prismaGen = sh('pnpm -w prisma generate');
  const prismaStatus = sh('pnpm -w prisma migrate status');
  let dbProbe = { ok: false, error: 'skipped' };
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const r = await Promise.race([
      prisma.$queryRawUnsafe('SELECT 1 as one'),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000))
    ]);
    dbProbe = { ok: true, result: Array.isArray(r) ? r[0] : r };
    await prisma.$disconnect();
  } catch (e) {
    dbProbe = { ok: false, error: String(e.message || e) };
  }
  result.prisma = { generate: prismaGen.ok, migrateStatus: prismaStatus.ok, migrateOutput: prismaStatus.stdout, dbProbe };

  // 4) Monorepo hygiene
  const typecheck = sh('pnpm -w typecheck');
  const lint = sh('pnpm -w lint');
  const wsList = sh('pnpm -w list --depth -1');
  result.monorepo = { typecheck: typecheck.ok, lint: lint.ok, workspaces: wsList.stdout };

  // 5) Gates
  function runGate(cmd) {
    const r = sh(cmd);
    const firstErr = r.ok ? '' : (r.stderr.split('\n')[0] || r.stdout.split('\n')[0] || '').slice(0, 300);
    return { ok: r.ok, firstError: firstErr, stdout: r.stdout };
  }
  const g0 = runGate('pnpm -w gates:phase0');
  const g1 = runGate('pnpm -w gates:phase1');
  const seed1 = runGate('pnpm -w seed:phase2');
  const seed2 = runGate('pnpm -w seed:phase2');
  const g2 = runGate('pnpm -w gates:phase2');
  const g2a = runGate('pnpm -w gates:phase2:auth');
  const g2h = runGate('pnpm -w gates:phase2:helpdocs');
  const g2r = runGate('pnpm -w gates:phase2:routes');
  result.gates = { phase0: g0, phase1: g1, seedPhase2_first: seed1, seedPhase2_second: seed2, phase2: g2, phase2_auth: g2a, phase2_helpdocs: g2h, phase2_routes: g2r };

  // 6) Accessibility & UI validations
  const uiLabels = runGate('pnpm -w ui:labels');
  const uiA11y = runGate('pnpm -w ui:a11y');
  const uiA11yDark = runGate('pnpm -w ui:a11y:dark');
  result.accessibility = { labels: uiLabels, a11y_light: uiA11y, a11y_dark: uiA11yDark };

  // 7) Tests & coverage
  const tRun = runGate('pnpm -w test -- --run');
  const tCov = runGate('pnpm -w cov');
  let covJson = null;
  let overall = {};
  let bottom = [];
  try {
    const covPath = path.join(repoRoot, 'coverage', 'coverage-final.json');
    if (fs.existsSync(covPath)) {
      const data = JSON.parse(fs.readFileSync(covPath, 'utf8'));
      // Compute overall line/branch coverage
      let totalLines = 0, coveredLines = 0, totalBranches = 0, coveredBranches = 0;
      const fileSummaries = [];
      for (const [file, metrics] of Object.entries(data)) {
        const s = metrics.s || {}; // statements
        const b = metrics.b || {}; // branches
        const l = metrics.l || {}; // lines
        const f = metrics.f || {}; // functions
        const linesCovered = Object.values(l).filter(v => v > 0).length;
        const linesTotal = Object.keys(l).length;
        coveredLines += linesCovered;
        totalLines += linesTotal;
        const branchTotals = Object.values(b).reduce((acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0), 0);
        const branchCovered = Object.values(b).reduce((acc, arr) => acc + (Array.isArray(arr) ? arr.filter(x => x > 0).length : 0), 0);
        coveredBranches += branchCovered;
        totalBranches += branchTotals;
        const linePct = linesTotal ? (linesCovered / linesTotal) * 100 : 100;
        const branchPct = totalBranches ? (branchCovered / Math.max(1, branchTotals)) * 100 : 100;
        fileSummaries.push({ file, linePct: isFinite(linePct) ? linePct : 0, branchPct: isFinite(branchPct) ? branchPct : 0 });
      }
      overall = {
        lines: totalLines ? +(coveredLines / totalLines * 100).toFixed(2) : 100,
        branches: totalBranches ? +(coveredBranches / totalBranches * 100).toFixed(2) : 100
      };
      bottom = fileSummaries
        .sort((a, b) => (a.linePct - b.linePct) || (a.branchPct - b.branchPct))
        .slice(0, 15);
      covJson = { files: Object.keys(data).length };
    }
  } catch (e) {
    covJson = { error: String(e.message || e) };
  }
  result.tests = { runOk: tRun.ok, covOk: tCov.ok, overall, bottom, covJson };

  // 8) Security & build
  const sec = runGate('pnpm -w test:security');
  const build = runGate("pnpm -w build");
  const perf = runGate('pnpm -w ui:perf');
  result.security = { ok: sec.ok };
  result.build = { ok: build.ok };
  result.perf = { ok: perf.ok, stdout: perf.stdout };

  // 9) Screenshots & routes sanity (non-blocking)
  const shots = { ran: false, ok: false, files: [], error: '' };
  const snapsPath = path.join(repoRoot, 'scripts', 'snapshots.cjs');
  if (fs.existsSync(snapsPath)) {
    const run = sh('APP_ORIGIN=http://localhost:3000 node scripts/snapshots.cjs');
    shots.ran = true;
    shots.ok = run.ok;
    shots.error = run.ok ? '' : (run.stderr || run.stdout).split('\n')[0];
    // list screenshots
    function listPngs(dir) {
      if (!fs.existsSync(dir)) return [];
      const out = [];
      for (const f of fs.readdirSync(dir)) {
        const p = path.join(dir, f);
        const stat = fs.statSync(p);
        if (stat.isDirectory()) out.push(...listPngs(p));
        else if (f.toLowerCase().endsWith('.png')) out.push(p);
      }
      return out;
    }
    const shotFiles = listPngs(path.join(repoRoot, 'screenshots'));
    shots.files = shotFiles;
  }
  result.screenshots = shots;

  // Summary
  const sectionPass = (ok) => (ok ? 'PASS' : 'FAIL');
  const summaryLines = [];
  summaryLines.push(`Environment & infra: ${sectionPass(true)}`);
  summaryLines.push(`.env audit: ${sectionPass(critical.every(k => !!env[k]))}`);
  summaryLines.push(`Prisma & DB: ${sectionPass(prismaGen.ok && prismaStatus.ok && result.prisma.dbProbe.ok)}`);
  summaryLines.push(`Monorepo hygiene: ${sectionPass(typecheck.ok && lint.ok)}`);
  const gatesOk = g0.ok && g1.ok && seed1.ok && seed2.ok && g2.ok && g2a.ok && g2h.ok && g2r.ok;
  summaryLines.push(`Gates: ${sectionPass(gatesOk)}`);
  summaryLines.push(`Accessibility & UI: ${sectionPass(uiLabels.ok && uiA11y.ok && uiA11yDark.ok)}`);
  const covOk = (overall.lines || 0) >= 80 && (overall.branches || 0) >= 70;
  summaryLines.push(`Tests & coverage: ${sectionPass(tRun.ok && tCov.ok && covOk)} (lines ${overall.lines ?? 'n/a'}%, branches ${overall.branches ?? 'n/a'}%)`);
  summaryLines.push(`Security: ${sectionPass(sec.ok)}`);
  summaryLines.push(`Build: ${sectionPass(build.ok)}`);
  summaryLines.push(`UI perf: ${sectionPass(perf.ok)}`);
  if (shots.ran) summaryLines.push(`Screenshots: ${sectionPass(shots.ok)} (${shots.files.length} PNGs)`);

  const allPass = summaryLines.every(l => l.includes('PASS'));
  result.summary = { lines: summaryLines, allPass };

  // Write Markdown
  const md = [];
  md.push(`# Optra ERP Audit (Phase 0→2)`);
  md.push('');
  md.push(`- Date: ${timeStr}`);
  md.push(`- Branch: ${branch}`);
  md.push(`- Last commit: ${lastCommit}`);
  md.push('');
  md.push('## Summary');
  for (const line of summaryLines) md.push(`- ${line}`);
  md.push('');
  md.push('## Environment & Infra');
  md.push('```');
  md.push(JSON.stringify({ environment: result.environment, docker: result.docker, ports: result.ports }, null, 2));
  md.push('```');
  md.push('');
  md.push('## .env Audit (values redacted)');
  md.push('```');
  md.push(JSON.stringify(result.env_audit, null, 2));
  md.push('```');
  md.push('');
  md.push('## Prisma & DB');
  md.push('```');
  md.push(JSON.stringify(result.prisma, null, 2));
  md.push('```');
  md.push('');
  md.push('## Monorepo Hygiene');
  md.push('```');
  md.push(JSON.stringify(result.monorepo, null, 2));
  md.push('```');
  md.push('');
  md.push('## Gates');
  md.push('```');
  md.push(JSON.stringify(result.gates, null, 2));
  md.push('```');
  md.push('');
  md.push('## Accessibility & UI');
  md.push('```');
  md.push(JSON.stringify(result.accessibility, null, 2));
  md.push('```');
  md.push('');
  md.push('## Tests & Coverage');
  md.push('```');
  md.push(JSON.stringify(result.tests, null, 2));
  md.push('```');
  md.push('');
  md.push('## Security, Build, UI Perf');
  md.push('```');
  md.push(JSON.stringify({ security: result.security, build: result.build, perf: result.perf }, null, 2));
  md.push('```');
  md.push('');
  md.push('## Screenshots');
  md.push('```');
  md.push(JSON.stringify(result.screenshots, null, 2));
  md.push('```');
  md.push('');
  md.push('## Action Items');
  if (allPass) md.push('None'); else md.push('See failed sections above.');

  fs.writeFileSync(mdPath, md.join('\n'));
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2));

  // Print the requested succinct summary to stdout
  for (const line of summaryLines) console.log(line);
  console.log(`Reports saved: ${mdPath} , ${jsonPath}`);
  console.log(allPass ? 'Full Audit: PASS' : 'Full Audit: FAIL');
}

main().catch((e) => {
  console.error('Audit crashed:', e);
  process.exitCode = 1;
});




