const NIGHTLY = '-nightly.';
const NUMBER = /^\d+$/;

type Parsed = [major: number, release: number, released: number, nightly: number];

export function parseLuftVersion(text: string): Parsed | null {
  const [release, nightly, extra] = text.split(NIGHTLY);
  if (extra !== undefined || (nightly !== undefined && !NUMBER.test(nightly))) return null;
  const [major, minor, ...rest] = release.split('.');
  if (rest.length || !NUMBER.test(major ?? '') || !NUMBER.test(minor ?? '')) return null;
  return [Number(major), Number(minor), nightly === undefined ? 1 : 0, Number(nightly ?? 0)];
}

export function luftVersionAtLeast(running: string, minimum: string): boolean {
  const have = parseLuftVersion(running);
  const needed = parseLuftVersion(minimum);
  if (!have || !needed) return false;
  const differs = have.findIndex((part, index) => part !== needed[index]);
  return differs === -1 || have[differs] > needed[differs];
}
