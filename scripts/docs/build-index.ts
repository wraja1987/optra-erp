/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';

const DOCS = path.join(process.cwd(), 'docs');
const out = path.join(DOCS, 'index.json');
const index: Record<string,string[]> = {};

function walk(dir: string, prefix: string[] = []) {
  for (const e of fs.readdirSync(dir)) {
    const p = path.join(dir, e);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) walk(p, [...prefix, e]);
    else if (p.endsWith('.mdx')) {
      const key = prefix.join('/') || 'root';
      index[key] = index[key] || [];
      index[key].push('/docs/' + [...prefix, e].join('/'));
    }
  }
}

walk(DOCS);
fs.writeFileSync(out, JSON.stringify(index, null, 2));
console.log('Docs index built');


