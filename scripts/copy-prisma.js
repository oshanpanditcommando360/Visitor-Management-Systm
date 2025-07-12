const { cpSync, existsSync, mkdirSync } = require('fs');
const { join, dirname } = require('path');

const destRoot = join('.next', 'standalone');
const paths = ['node_modules/.prisma', 'lib/generated/prisma'];

for (const p of paths) {
  if (existsSync(p)) {
    const dest = join(destRoot, p);
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(p, dest, { recursive: true });
  }
}
console.log('Copied Prisma directories to standalone folder');
