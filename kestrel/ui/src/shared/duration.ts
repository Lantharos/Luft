export function shortDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return `${hours ? `${hours} h ` : ''}${minutes} min`;
}
