import Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';
import Shell from 'gi://Shell';

import type { ContextMenus } from '../../../../desktop/menus/contextMenus.js';
import { t } from '../../../../shared/i18n/index.js';
import { appKey } from '../../../../shared/launchHistory.js';
import type { Ranked, SearchItem } from '../item.js';
import { rank, searchable, type Query, type Searchable } from '../ranking.js';

const LIMIT = 8;

interface AppEntry extends Searchable {
  app: Gio.AppInfo;
}

function searchTerms(app: Gio.AppInfo): string[] {
  if (!(app instanceof GioUnix.DesktopAppInfo)) return [];
  const keywords = app.get_keywords() ?? [];
  const genericName = app.get_generic_name();
  return genericName ? [genericName, ...keywords] : keywords;
}

export class AppResults {
  private entries: AppEntry[] = [];

  constructor(private readonly menus: ContextMenus, private readonly launch: (app: Gio.AppInfo) => void) {}

  update(apps: Gio.AppInfo[]): void {
    this.entries = apps.map(app => searchable({ app }, appKey(app.get_id()!), app.get_display_name(), searchTerms(app)));
  }

  find(search: Query, launches: (key: string) => number): Ranked[] {
    return rank(this.entries, search, 0, launches).slice(0, LIMIT).map(({ entry, score }) => ({ item: this.item(entry), score }));
  }

  private item({ app, key }: AppEntry): SearchItem {
    return {
      key, title: app.get_display_name(), description: app.get_description() ?? '',
      icon: app,
      activate: () => this.launch(app),
      menu: () => {
        const shellApp = Shell.AppSystem.get_default().lookup_app(app.get_id()!);
        return shellApp ? this.menus.appEntries(shellApp) : [{ label: t('start-open'), run: () => this.launch(app) }];
      },
    };
  }
}
