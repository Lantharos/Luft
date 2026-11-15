export interface Split<T> {
  shown: T[];
  hidden: T[];
}

export function capacityFor(count: number, room: number, slot: number): number {
  return count * slot <= room ? count : Math.max(0, Math.floor(room / slot) - 1);
}

export function splitApps<T>(apps: T[], capacity: number, priority: (app: T) => number): Split<T> {
  if (apps.length <= capacity) return { shown: apps, hidden: [] };
  const kept = new Set(apps
    .map((app, index) => ({ app, index, priority: priority(app) }))
    .sort((a, b) => b.priority - a.priority || a.index - b.index)
    .slice(0, capacity)
    .map(({ app }) => app));
  return { shown: apps.filter(app => kept.has(app)), hidden: apps.filter(app => !kept.has(app)) };
}
