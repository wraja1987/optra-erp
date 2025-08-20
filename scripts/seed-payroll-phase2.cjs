const fs = require('fs');
const path = require('path');
const goldenDir = path.join(process.cwd(),'golden');
if (!fs.existsSync(goldenDir)) fs.mkdirSync(goldenDir);
fs.writeFileSync(path.join(goldenDir,'eps.json'), JSON.stringify({ employmentAllowance:true, levy:0.5 },null,2));
fs.writeFileSync(path.join(goldenDir,'fps.json'), JSON.stringify({ lateReason:'B', starters:['A','B','C'] },null,2));
fs.writeFileSync(path.join(goldenDir,'p11db.json'), JSON.stringify({ class1a:true },null,2));
console.log('Payroll Phase 2 seed complete');

