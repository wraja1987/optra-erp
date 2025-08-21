/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../../apps/web/public/icons');
fs.mkdirSync(outDir, { recursive: true });

// Simple solid blue PNGs (192 and 512). Base64 pixels generated offline.
const icons = [
  { name: 'icon-192.png', b64: 'iVBORw0KGgoAAAANSUhEUgAAAMAAAAAwCAYAAAB3J8JbAAAAKElEQVR4nO3BAQ0AAADCoPdPbQ8HFAAAAAAAAAAAAAAAAAAAAAAAAO4G8T8AAZ1uGzEAAAAASUVORK5CYII=' },
  { name: 'icon-512.png', b64: 'iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAAKElEQVR4nO3BAQ0AAADCoPdPbQ43oAAAAAAAAAAAAAAAAAAAAAAAAN4G8V8AAeKQHhIAAAAASUVORK5CYII=' },
];

for (const icon of icons) {
  const target = path.join(outDir, icon.name);
  fs.writeFileSync(target, Buffer.from(icon.b64, 'base64'));
  console.log('wrote', target);
}

console.log('Icons generated.');


