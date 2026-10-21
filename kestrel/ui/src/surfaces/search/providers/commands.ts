import type Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';

import { launchHistory } from '../../../shared/apps/launchHistory.js';
import type { Ranked, SearchItem } from '../item.js';
import { rank, searchable, type Query, type Searchable } from '../ranking.js';

const LIMIT = 3;
const BIAS = 0.3;

interface CommandEntry extends Searchable {
  app: GioUnix.DesktopAppInfo;
  action: string;
  title: string;
}

export class CommandResults {
  private entries: CommandEntry[] = [];

  constructor(private readonly close: () => void) {}

  update(apps: Gio.AppInfo[]): void {
    this.entries = apps.flatMap(app => app instanceof GioUnix.DesktopAppInfo ? app.list_actions().map(action => {
      const title = app.get_action_name(action);
      return searchable({ app, action, title }, `command:${app.get_id()}:${action}`, title, [app.get_display_name()]);
    }) : []);
  }

  find(search: Query, launches: (key: string) => number): Ranked[] {
    return rank(this.entries, search, BIAS, launches).slice(0, LIMIT).map(({ entry, score }) => ({ item: this.item(entry), score }));
  }

  private item({ app, action, title, key }: CommandEntry): SearchItem {
    return {
      key, title, description: app.get_display_name(), icon: app,
      activate: () => {
        launchHistory.record(key);
        this.close();
        app.launch_action(action, global.create_app_launch_context(0, -1));
      },
    };
  }
}
