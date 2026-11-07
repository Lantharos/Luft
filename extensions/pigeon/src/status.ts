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

/** One line on what Pigeon is doing, for the quick settings tile and the taskbar. */
export function status(pigeon: Pigeon): string {
  const { t, settings } = pigeon.extension;
  const fraction = moving(pigeon);
  if (fraction !== null) return t('moving', { percent: percent(fraction) });
  if (pigeon.devices.length) return t('nearby', { count: pigeon.devices.length });
  return settings.get<boolean>('receive') ? t('ready') : t('not-receiving');
}
