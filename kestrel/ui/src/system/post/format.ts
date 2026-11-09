import type { Peer } from './client.js';

export const ICON = 'post-symbolic';

const UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte'] as const;
const KINDS: Record<string, string> = {
  mobile: 'phone-symbolic',
  desktop: 'computer-symbolic',
  web: 'web-browser-symbolic',
  headless: 'utilities-terminal-symbolic',
  server: 'network-server-symbolic',
};
const LINK = /^https?:\/\/\S+$/i;

/** A size the way people read it, such as 4.2 MB. */
export function size(bytes: number): string {
  const step = Math.min(UNITS.length - 1, bytes > 0 ? Math.floor(Math.log(bytes) / Math.log(1000)) : 0);
  const value = bytes / 1000 ** step;
  return new Intl.NumberFormat(undefined, {
    style: 'unit', unit: UNITS[step], unitDisplay: 'short', maximumFractionDigits: step && value < 10 ? 1 : 0,
  }).format(value);
}

export function percent(fraction: number): string {
  return new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits: 0 }).format(fraction);
}

export function deviceIcon(peer: Pick<Peer, 'kind'>): string {
  return KINDS[peer.kind] ?? KINDS.desktop!;
}

/** The text alone, when it's a web link people would want to open. */
export function link(text: string): string | null {
  const trimmed = text.trim();
  return LINK.test(trimmed) ? trimmed : null;
}

export function fileName(path: string): string {
  return path.slice(path.lastIndexOf('/') + 1);
}

export function folderOf(path: string): string {
  return path.slice(0, path.lastIndexOf('/')) || '/';
}

export const fileUri = (path: string): string => `file://${path.split('/').map(encodeURIComponent).join('/')}`;
