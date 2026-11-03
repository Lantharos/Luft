type Parsed = { core: number[]; pre: string[] };

function parse(version: string): Parsed {
  const [core, pre] = version.split('+')[0].split(/-(.*)/s);
  return { core: core.split('.').map(Number), pre: pre ? pre.split('.') : [] };
}

function compareIdentifiers(a: string, b: string) {
  const numeric = /^\d+$/;
  if (numeric.test(a) && numeric.test(b)) return Number(a) - Number(b);
  if (numeric.test(a) !== numeric.test(b)) return numeric.test(a) ? -1 : 1;
  return a < b ? -1 : a > b ? 1 : 0;
}

export function compareVersions(a: string, b: string) {
  const left = parse(a);
  const right = parse(b);
  for (let index = 0; index < 3; index++) {
    if (left.core[index] !== right.core[index]) return left.core[index] - right.core[index];
  }
  if (!left.pre.length || !right.pre.length) return right.pre.length - left.pre.length;
  for (let index = 0; index < Math.min(left.pre.length, right.pre.length); index++) {
    const order = compareIdentifiers(left.pre[index], right.pre[index]);
    if (order) return order;
  }
  return left.pre.length - right.pre.length;
}

export const newest = (versions: string[]) => versions.reduce<string | undefined>((best, version) => (!best || compareVersions(version, best) > 0 ? version : best), undefined);

function following(version: string) {
  const { core, pre } = parse(version);
  return pre.length ? core.join('.') : [core[0], core[1], core[2] + 1].join('.');
}

export function nextVersion(floor: string, taken: string[]) {
  const last = newest(taken);
  return last ? newest([floor, following(last)])! : floor;
}
