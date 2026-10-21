export const DAY_MS = 86_400_000;

export interface Day {
  year: number;
  month: number;
  day: number;
}

export const dayOf = (date: Date): Day => ({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() });

export const dayNumber = ({ year, month, day }: Day) => Math.floor(Date.UTC(year, month - 1, day) / DAY_MS);

export function fromDayNumber(number: number): Day {
  const date = new Date(number * DAY_MS);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}
