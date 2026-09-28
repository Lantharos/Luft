import Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';

const WORD_START = /[\s\-_.]/;

export interface Searchable {
  name: string;
  keywords: string[];
}

interface Entry extends Searchable {
  app: Gio.AppInfo;
}

function score({ name, keywords }: Searchable, query: string): number {
  const index = name.indexOf(query);
  if (index === 0) return 0;
  if (index > 0 && WORD_START.test(name[index - 1])) return 1;
  if (keywords.some(keyword => keyword.startsWith(query))) return 2;
  if (index > 0) return 3;
  return -1;
}

export class AppIndex {
  private apps: Entry[] = [];

  update(apps: Gio.AppInfo[]): void {
    const entry = (app: Gio.AppInfo): Entry => ({
      app,
      name: app.get_display_name().toLocaleLowerCase(),
      keywords: (app instanceof GioUnix.DesktopAppInfo ? app.get_keywords() ?? [] : []).map(keyword => keyword.toLocaleLowerCase()),
    });
    this.apps = apps.map(entry);
  }

  search(query: string): Gio.AppInfo[] {
    return rank(this.apps, query).map(entry => entry.app);
  }
}

export function rank<T extends Searchable>(entries: T[], query: string): T[] {
  return entries
    .map(entry => ({ entry, score: score(entry, query) }))
    .filter(({ score }) => score >= 0)
    .sort((a, b) => a.score - b.score)
    .map(({ entry }) => entry);
}
