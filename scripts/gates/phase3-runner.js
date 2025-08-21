#!/usr/bin/env node
/* eslint-disable no-console */
const { execSync } = require('child_process');

function run(cmd) {
  console.log(`$ ${cmd}`);
  return execSync(cmd, { stdio: 'inherit' });
}

try {
  run('pnpm -w cov');
  run('pnpm -w ui:a11y');
  run('pnpm -w ui:a11y:dark');
  run('pnpm -w ui:perf');
  console.log('Phase 3 gates runner finished.');
} catch (e) {
  console.error('Phase 3 gates failed.');
  process.exitCode = 1;
}


