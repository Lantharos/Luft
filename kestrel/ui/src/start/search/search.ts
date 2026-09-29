import Gio from 'gi://Gio';
import Shell from 'gi://Shell';
import St from 'gi://St';
import type { ContextMenus } from '../../menus/contextMenus.js';
import { appKey, launchHistory } from '../../shared/launchHistory.js';
import { indexApps, type AppEntry } from './apps.js';
import { openSettings, SETTINGS_PAGES, type SettingsPage } from '../../settings/pages.js';
import { byRelevance, rank, type Match, type Searchable } from './ranking.js';
import { calculate } from './calculator.js';
import { RecentFiles } from './files.js';
import type { SearchItem } from './item.js';

const SETTINGS_LIMIT = 4;
const FILES_LIMIT = 5;

interface PageEntry extends Searchable {
  page: SettingsPage;
}

const SEARCHABLE_PAGES: PageEntry[] = SETTINGS_PAGES.map(page => ({
  page,
  key: settingKey(page),
  name: page.title.toLocaleLowerCase(),
  keywords: page.keywords,
}));

function settingKey(page: SettingsPage): string {
  return `setting:${page.id}`;
}

export class StartSearch {
  private apps: AppEntry[] = [];
  private readonly files = new RecentFiles();

  constructor(
    private readonly menus: ContextMenus,
    private readonly launch: (app: Gio.AppInfo) => void,
    private readonly close: () => void,
  ) {}

  update(apps: Gio.AppInfo[]): void {
    this.apps = indexApps(apps);
  }

  results(text: string): SearchItem[] {
    const query = text.trim().toLocaleLowerCase();
    const items: SearchItem[] = [];
    const result = calculate(query);
    if (result !== null) items.push(this.calculation(text.trim(), result));
    const launches = launchHistory.weigher();
    const matches: Match<AppEntry | PageEntry>[] = [
      ...rank(this.apps, query, launches),
      ...rank(SEARCHABLE_PAGES, query, launches).slice(0, SETTINGS_LIMIT),
    ];
    for (const { entry } of matches.sort(byRelevance)) items.push('app' in entry ? this.app(entry.app) : this.setting(entry.page));
    for (const file of this.files.search(query, FILES_LIMIT)) {
      items.push({
        key: `file:${file.uri}`, title: file.name, description: file.folder, icon: file.icon,
        activate: () => this.open(file.uri),
        menu: () => [
          { label: 'Open', run: () => this.open(file.uri) },
          { label: 'Open containing folder', run: () => this.open(Gio.File.new_for_uri(file.uri).get_parent()!.get_uri()) },
        ],
      });
    }
    return items;
  }

  private app(app: Gio.AppInfo): SearchItem {
    return {
      key: appKey(app.get_id()!), title: app.get_display_name(), description: app.get_description() ?? '',
      icon: app.get_icon() ?? Gio.ThemedIcon.new('application-x-executable'),
      activate: () => this.launch(app),
      menu: () => {
        const shellApp = Shell.AppSystem.get_default().lookup_app(app.get_id()!);
        return shellApp ? this.menus.appEntries(shellApp) : [{ label: 'Open', run: () => this.launch(app) }];
      },
    };
  }

  private setting(page: SettingsPage): SearchItem {
    return {
      key: settingKey(page), title: page.title, description: 'Settings',
      icon: Gio.ThemedIcon.new(page.icon),
      activate: () => {
        launchHistory.record(settingKey(page));
        this.close();
        openSettings(page.id);
      },
    };
  }

  private calculation(expression: string, result: string): SearchItem {
    return {
      key: 'calculation', title: `= ${result}`, description: `${expression}, press Enter to copy`,
      icon: Gio.ThemedIcon.new('accessories-calculator-symbolic'),
      activate: () => {
        St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, result);
        this.close();
      },
    };
  }

  private open(uri: string): void {
    Gio.AppInfo.launch_default_for_uri(uri, (global as unknown as Shell.Global).create_app_launch_context(0, -1));
    this.close();
  }
}
