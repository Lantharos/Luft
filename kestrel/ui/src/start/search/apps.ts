import Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';

const SETTINGS_PANEL = /^gnome-.+-panel\.desktop$/;
const WORD_START = /[\s\-_.]/;

interface Entry {
  app: Gio.AppInfo;
  name: string;
  keywords: string[];
}

export interface AppMatch {
  app: Gio.AppInfo;
  settings: boolean;
}

function score({ name, keywords }: Entry, query: string): number {
  const index = name.indexOf(query);
  if (index === 0) return 0;
  if (index > 0 && WORD_START.test(name[index - 1])) return 1;
  if (keywords.some(keyword => keyword.startsWith(query))) return 2;
  if (index > 0) return 3;
  return -1;
}

export class AppIndex {
  private apps: Entry[] = [];
  private panels: Entry[] = [];

  update(apps: Gio.AppInfo[], installed: Gio.AppInfo[]): void {
    const entry = (app: Gio.AppInfo): Entry => ({
      app,
      name: app.get_display_name().toLocaleLowerCase(),
      keywords: (app instanceof GioUnix.DesktopAppInfo ? app.get_keywords() ?? [] : []).map(keyword => keyword.toLocaleLowerCase()),
    });
    this.apps = apps.map(entry);
    this.panels = installed.filter(app => SETTINGS_PANEL.test(app.get_id() ?? '')).map(entry);
  }

  search(query: string, settingsLimit: number): AppMatch[] {
    const ranked = (entries: Entry[]) => entries
      .map(entry => ({ entry, score: score(entry, query) }))
      .filter(({ score }) => score >= 0)
      .sort((a, b) => a.score - b.score)
      .map(({ entry }) => entry.app);
    return [
      ...ranked(this.apps).map(app => ({ app, settings: false })),
      ...ranked(this.panels).slice(0, settingsLimit).map(app => ({ app, settings: true })),
    ];
  }
}
