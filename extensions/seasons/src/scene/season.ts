import type { Season } from '@luft/extension-api';

const BY_MONTH: Season[] = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'];

/** The season by the calendar in the north, for when the weather where the computer is isn't known. */
export function seasonOf(date: Date): Season {
  return BY_MONTH[date.getMonth()];
}
