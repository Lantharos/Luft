import { DAY_MS, dayNumber, dayOf, fromDayNumber } from '../../../shared/days.js';

const EPOCH_WEEKDAY = 4;

export function dateOf(number: number): Date {
  const { year, month, day } = fromDayNumber(number);
  return new Date(year, month - 1, day);
}

export const monthIndex = (date: Date) => date.getFullYear() * 12 + date.getMonth();

export const firstOfMonth = (month: number) => new Date(Math.floor(month / 12), month % 12, 1);

export function isoWeek(date: Date): number {
  const thursday = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 3 - (date.getDay() + 6) % 7));
  return 1 + Math.floor((thursday.getTime() - Date.UTC(thursday.getUTCFullYear(), 0, 1)) / DAY_MS / 7);
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
    return this.weekOf(dayNumber(dayOf(firstOfMonth(month))));
  }

  nearestMonth(position: number): number {
    const inTopRow = monthIndex(dateOf(this.firstDay(Math.floor(position)) + 6));
    return [inTopRow - 1, inTopRow, inTopRow + 1].reduce((best, month) =>
      Math.abs(this.startOf(month) - position) < Math.abs(this.startOf(best) - position) ? month : best);
  }
}
