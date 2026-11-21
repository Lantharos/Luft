import Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';
import Shell from 'gi://Shell';

import type { ContextMenus, MenuEntry } from '../../../desktop/menus/contextMenus.js';
import { t } from '../../../shared/i18n/index.js';
import { appKey, launchHistory } from '../../../shared/apps/launchHistory.js';
import type { Ranked, SearchItem } from '../item.js';
import { rank, searchable, type Query, type Searchable } from '../ranking.js';
import { appName } from '../../../shared/apps/names.js';
import { launchContext } from '../../../shared/apps/launch.js';

const LIMIT = 8;

interface AppEntry extends Searchable {
  app: Gio.AppInfo;
}

export function searchTerms(app: Gio.AppInfo): string[] {
  if (!(app instanceof GioUnix.DesktopAppInfo)) return [];
  const keywords = app.get_keywords() ?? [];
  const genericName = app.get_generic_name();
  return genericName ? [genericName, ...keywords] : keywords;
}

export function launchApp(app: Gio.AppInfo): void {
  launchHistory.record(appKey(app.get_id()!));
  const shellApp = Shell.AppSystem.get_default().lookup_app(app.get_id() ?? '');
  if (shellApp) shellApp.activate();
  else app.launch([], launchContext(app));
}

export class AppResults {
  private entries: AppEntry[] = [];

  constructor(private readonly menus: ContextMenus, private readonly close: () => void, private readonly extra: (app: Gio.AppInfo) => MenuEntry[]) {}

  update(apps: Gio.AppInfo[]): void {
    this.entries = apps.map(app => searchable({ app }, appKey(app.get_id()!), appName(app), searchTerms(app)));
  }

  find(search: Query, launches: (key: string) => number): Ranked[] {
    return rank(this.entries, search, 0, launches).slice(0, LIMIT).map(({ entry, score }) => ({ item: this.item(entry), score }));
  }

  private launch(app: Gio.AppInfo): void {
    launchApp(app);
    this.close();
  }

  private item({ app, key }: AppEntry): SearchItem {
    return {
      key, title: appName(app), description: app.get_description() ?? '',
      icon: app,
      activate: () => this.launch(app),
      menu: () => {
        const shellApp = Shell.AppSystem.get_default().lookup_app(app.get_id()!);
        const extra = this.extra(app);
        return shellApp ? this.menus.appEntries(shellApp, { extra }) : [{ label: t('gust-open'), run: () => this.launch(app) }, ...extra];
      },
    };
  }
}
