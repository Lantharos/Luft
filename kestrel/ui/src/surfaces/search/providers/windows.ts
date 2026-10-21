import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import { themedIcon } from '../icons.js';
import type { Ranked, SearchItem } from '../item.js';
import { rank, searchable, type Query, type Searchable } from '../ranking.js';

const LIMIT = 5;
const BIAS = 0.1;

interface WindowEntry extends Searchable {
  window: Meta.Window;
  app: Shell.App | null;
  title: string;
}

export function openWindows(): Meta.Window[] {
  const display = (global as unknown as Shell.Global).display;
  return display.get_tab_list(Meta.TabList.NORMAL_ALL, null).filter(window => !window.skip_taskbar);
}

export class WindowResults {
  private entries = new Map<Meta.Window, WindowEntry>();

  constructor(private readonly activateWindow: (window: Meta.Window) => void, private readonly close: () => void) {}

  find(search: Query): Ranked[] {
    const tracker = Shell.WindowTracker.get_default();
    const entries = new Map(openWindows().map(window => {
      const title = window.get_title() ?? '';
      const known = this.entries.get(window);
      if (known?.title === title) return [window, known] as const;
      const app = tracker.get_window_app(window);
      return [window, searchable({ window, app, title }, `window:${window.get_stable_sequence()}`, title, app ? [app.get_name()] : [])] as const;
    }));
    this.entries = entries;
    return rank([...entries.values()], search, BIAS, () => 0).slice(0, LIMIT).map(({ entry, score }) => ({ item: this.item(entry), score }));
  }

  recent(limit: number): SearchItem[] {
    const tracker = Shell.WindowTracker.get_default();
    return openWindows().slice(0, limit).map(window => this.item({ window, app: tracker.get_window_app(window) }));
  }

  private item({ window, app }: Pick<WindowEntry, 'window' | 'app'>): SearchItem {
    return {
      key: `window:${window.get_stable_sequence()}`,
      title: window.get_title() ?? app?.get_name() ?? '',
      description: app?.get_name() ?? '',
      icon: app ?? themedIcon('application-x-executable-symbolic'),
      preview: { kind: 'window', window },
      activate: () => {
        this.close();
        this.activateWindow(window);
      },
    };
  }
}
