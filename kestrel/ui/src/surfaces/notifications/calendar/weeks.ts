const DAY = 86_400_000;
const EPOCH_WEEKDAY = 4;

export const dayNumber = (date: Date) => Math.round(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY);

export function dateOf(day: number): Date {
  const utc = new Date(day * DAY);
  return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
}

export const monthIndex = (date: Date) => date.getFullYear() * 12 + date.getMonth();

export const firstOfMonth = (month: number) => new Date(Math.floor(month / 12), month % 12, 1);

export function isoWeek(date: Date): number {
  const thursday = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 3 - (date.getDay() + 6) % 7));
  return 1 + Math.floor((thursday.getTime() - Date.UTC(thursday.getUTCFullYear(), 0, 1)) / DAY / 7);
}

export class Weeks {
  private shift = 0;

  set weekStart(day: number) {
    this.shift = (day - EPOCH_WEEKDAY + 7) % 7;
  }

  firstDay(week: number): number {
    return week * 7 + this.shift;
  }

  weekOf(day: number): number {
    return Math.floor((day - this.shift) / 7);
  }

  startOf(month: number): number {
    return this.weekOf(dayNumber(firstOfMonth(month)));
  }

  nearestMonth(position: number): number {
    const inTopRow = monthIndex(dateOf(this.firstDay(Math.floor(position)) + 6));
    return [inTopRow - 1, inTopRow, inTopRow + 1].reduce((best, month) =>
      Math.abs(this.startOf(month) - position) < Math.abs(this.startOf(best) - position) ? month : best);
  }
}
