/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';

const DOCS = path.join(process.cwd(), 'docs');
let issues = 0;

function walk(dir: string) {
  for (const e of fs.readdirSync(dir)) {
    const p = path.join(dir, e);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) walk(p);
    else if (p.endsWith('.mdx')) lint(p);
  }
}

function lint(file: string) {
  const s = fs.readFileSync(file, 'utf8');
  if (!s.startsWith('---')) { console.error('Missing front‑matter:', file); issues++; }
  if (!/\n## Overview\n/.test(s)) { console.error('Missing Overview:', file); issues++; }
}

walk(DOCS);
if (issues) { process.exitCode = 1; }
else console.log('Docs lint OK');


