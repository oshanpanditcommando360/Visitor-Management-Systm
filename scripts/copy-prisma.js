const { cpSync, existsSync, mkdirSync } = require('fs');
const { join, dirname } = require('path');

const destRoots = [
  join('.next', 'standalone'),
  join('.next', 'server'),
];
const paths = ['node_modules/.prisma', 'lib/generated/prisma'];

for (const destRoot of destRoots) {
  for (const p of paths) {
    if (existsSync(p)) {
      const dest = join(destRoot, p);
      mkdirSync(dirname(dest), { recursive: true });
      cpSync(p, dest, { recursive: true });
    }
  }
}
console.log('Copied Prisma directories to standalone and server folders');
