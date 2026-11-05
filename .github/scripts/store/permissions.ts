import { readFileSync } from 'node:fs';

const STORE = 'https://raw.githubusercontent.com/Lantharos/Store/main/packages/protocol/src/extensions.ts';
const TYPES = 'kestrel/ui/src/extensions/api/v1/types.ts';

const quoted = (text: string) => [...text.matchAll(/['"]([a-z-]+)['"]/g)].map((match) => match[1]);

function kestrelPermissions() {
  const union = /export type Permission =([^;]+);/.exec(readFileSync(TYPES, 'utf8'));
  if (!union) throw new Error(`${TYPES} has no Permission type`);
  return quoted(union[1]);
}

async function storePermissions() {
  const response = await fetch(STORE);
  if (!response.ok) throw new Error(`${STORE} answered ${response.status}`);
  const list = /EXTENSION_PERMISSIONS = \[([^\]]+)\]/.exec(await response.text());
  if (!list) throw new Error(`${STORE} has no EXTENSION_PERMISSIONS`);
  return new Set(quoted(list[1]));
}

let store: Set<string>;
try {
  store = await storePermissions();
} catch (error) {
  console.warn(`::warning::Couldn't compare extension permissions with schelf.store: ${(error as Error).message}`);
  process.exit(0);
}

const missing = kestrelPermissions().filter((permission) => !store.has(permission));
if (missing.length) {
  console.error(`schelf.store refuses extensions that ask for ${missing.join(', ')}; add them to EXTENSION_PERMISSIONS in its packages/protocol/src/extensions.ts and rebuild its publish action`);
  process.exit(1);
}
