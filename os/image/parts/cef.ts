// Prints the CEF build Sabine installs for 64-bit Linux: the newest Minimal build of the most
// stable channel, from Chromium 154 on, picked the way `sabine runtime install` picks it.

type File = { type: string };
type Build = { cef_version: string; channel?: string; files: File[] };

const INDEX = 'https://cef-builds.spotifycdn.com/index.json';
const MIN_MAJOR = 154;
const CHANNELS: Record<string, number> = { stable: 0, beta: 1, dev: 2, canary: 2 };

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
  .filter((build) => numbers(build.cef_version)[0] >= MIN_MAJOR)
  .filter((build) => build.files.some((file) => file.type === 'minimal'))
  .reduce<Build | undefined>((best, build) => {
    if (!best) return build;
    const channel = CHANNELS[build.channel ?? 'stable'] ?? 2;
    const bestChannel = CHANNELS[best.channel ?? 'stable'] ?? 2;
    if (channel !== bestChannel) return channel < bestChannel ? build : best;
    return newer(numbers(build.cef_version), numbers(best.cef_version)) ? build : best;
  }, undefined);

if (!chosen) throw new Error(`No Minimal CEF build for linux64 from Chromium ${MIN_MAJOR} on`);
console.log(chosen.cef_version);
