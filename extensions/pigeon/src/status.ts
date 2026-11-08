import type { Pigeon } from './pigeon.js';

/** How far everything on the way has got, from 0 to 1, or `null` while nothing is. */
export function moving(pigeon: Pigeon): number | null {
  const transfers = [...pigeon.transfers.values()].filter(transfer => transfer.stage === 'moving');
  if (!transfers.length) return null;
  const size = transfers.reduce((sum, transfer) => sum + transfer.size, 0);
  return size ? transfers.reduce((sum, transfer) => sum + transfer.done, 0) / size : 1;
}

export function percent(fraction: number): string {
  return new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits: 0 }).format(fraction);
}
