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
    else if (p.endsWith('.mdx')) check(p);
  }
}

function check(file: string) {
  const s = fs.readFileSync(file, 'utf8');
  if (s.includes('<script') || s.includes('onerror=') || s.includes('javascript:')) {
    console.error('Potentially unsafe content:', file);
    issues++;
  }
}

walk(DOCS);
if (issues) { process.exitCode = 1; }
else console.log('Docs sanitize OK');


