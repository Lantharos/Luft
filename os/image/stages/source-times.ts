import { existsSync, lstatSync, lutimesSync, readFileSync, readdirSync, readlinkSync, writeFileSync, type Stats } from 'node:fs';
import { join } from 'node:path';

type Seen = { hash: string; time: number };

const [record, ...roots] = process.argv.slice(2);

if (!record || roots.length === 0) {
  throw new Error('Usage: source-times.ts RECORD SOURCE...');
}

const known: Record<string, Seen> = existsSync(record) ? JSON.parse(readFileSync(record, 'utf8')) : {};
const seen: Record<string, Seen> = {};
const now = Date.now() / 1000;

function contents(path: string, stat: Stats) {
  if (stat.isSymbolicLink()) return readlinkSync(path);
  if (stat.isDirectory()) return readdirSync(path).sort().join('\0');
  return readFileSync(path);
}

function stamp(path: string, stat: Stats) {
  const hash = new Bun.CryptoHasher('sha256').update(contents(path, stat)).digest('hex');
  const before = known[path];
  const time = before?.hash === hash ? before.time : now;
  lutimesSync(path, time, time);
  seen[path] = { hash, time };
}

function visit(path: string, device: number) {
  const stat = lstatSync(path);
  if (stat.isDirectory()) {
    if (stat.dev !== device) return;
    for (const name of readdirSync(path)) visit(join(path, name), device);
  }
  stamp(path, stat);
}

for (const root of roots) visit(root, lstatSync(root).dev);
writeFileSync(record, JSON.stringify(seen));
