/** Milliseconds as minutes and seconds, such as 24:59. */
export function countdown(milliseconds: number): string {
  const seconds = Math.ceil(milliseconds / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

/** Whole minutes left, counting a started minute. */
export const minutesLeft = (milliseconds: number) => Math.ceil(milliseconds / 60_000);

export const timeOfDay = (at: number) => new Date(at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
