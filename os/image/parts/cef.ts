type File = { type: string };
type Build = { cef_version: string; channel?: string; files: File[] };

const INDEX = 'https://cef-builds.spotifycdn.com/index.json';
const OLDEST_CHROMIUM = 154;
const CHANNEL_RANK: Record<string, number> = { stable: 0, beta: 1, dev: 2, canary: 2 };

const numbers = (version: string) =>
  version
    .split(/[.+_-]/)
    .map(Number)
    .filter((part) => Number.isInteger(part));

const newer = (a: number[], b: number[]) => {
  for (let index = 0; index < Math.max(a.length, b.length); index++) {
    const difference = (a[index] ?? -1) - (b[index] ?? -1);
    if (difference) return difference > 0;
  }
  return false;
};

const response = await fetch(INDEX);
if (!response.ok) throw new Error(`${INDEX} answered ${response.status}`);
const builds: Build[] = (await response.json()).linux64.versions;

const chosen = builds
  .filter((build) => numbers(build.cef_version)[0] >= OLDEST_CHROMIUM)
  .filter((build) => build.files.some((file) => file.type === 'minimal'))
  .reduce<Build | undefined>((best, build) => {
    if (!best) return build;
    const rank = CHANNEL_RANK[build.channel ?? 'stable'] ?? 2;
    const bestRank = CHANNEL_RANK[best.channel ?? 'stable'] ?? 2;
    if (rank !== bestRank) return rank < bestRank ? build : best;
    return newer(numbers(build.cef_version), numbers(best.cef_version)) ? build : best;
  }, undefined);

if (!chosen) throw new Error(`No Minimal CEF build for linux64 from Chromium ${OLDEST_CHROMIUM} on`);
console.log(chosen.cef_version);
