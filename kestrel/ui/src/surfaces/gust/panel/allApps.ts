import Clutter from 'gi://Clutter';
import type Gio from 'gi://Gio';
import St from 'gi://St';

import type { ContextMenus } from '../../../desktop/menus/contextMenus.js';
import { appName } from '../../../shared/apps/names.js';
import type { SearchItem } from '../../search/item.js';
import { fold } from '../../search/ranking.js';
import { SearchResults } from '../../search/results/searchResults.js';

const LETTER = /\p{L}/u;

function initial(app: Gio.AppInfo): string {
  const letter = fold(appName(app)).charAt(0).toLocaleUpperCase();
  return LETTER.test(letter) ? letter : '#';
}

export class AllApps {
  readonly actor = new St.BoxLayout({ name: 'kestrel-gust-all-apps', orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-search-results kestrel-gust-all-apps', x_expand: true, visible: false });
  private readonly results: SearchResults;
  private apps: Gio.AppInfo[] = [];
  private current = false;

  constructor(menus: ContextMenus, reveal: (actor: St.Widget) => void, private readonly item: (app: Gio.AppInfo) => SearchItem) {
    this.results = new SearchResults(menus, reveal);
    this.results.setHighlighting(false);
  }

  update(apps: Gio.AppInfo[]): void {
    this.apps = apps;
    this.current = false;
    this.results.clear();
    if (this.actor.visible) this.render();
  }

  show(): void {
    this.actor.show();
    if (!this.current) this.render();
  }

  hide(): void {
    this.actor.hide();
  }

  private render(): void {
    const letters = new Map<string, SearchItem[]>();
    for (const app of this.apps) {
      const letter = initial(app);
      const items = letters.get(letter);
      if (items) items.push(this.item(app));
      else letters.set(letter, [this.item(app)]);
    }
    const groups = [...letters].map(([title, items]) => ({ title, items }));
    this.results.show(this.actor, { best: null, groups, pending: false, fresh: true });
    this.current = true;
  }
}
