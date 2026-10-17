import { launchHistory } from '../../../../shared/launchHistory.js';
import { openSettings, SETTINGS_PAGES, type SettingsPage } from '../../../../system/settingsPages.js';
import { themedIcon } from '../icons.js';
import type { Ranked, SearchItem } from '../item.js';
import { rank, searchable, type Query } from '../ranking.js';

const LIMIT = 4;
const BIAS = 0.4;

function description(page: SettingsPage): string {
  const [panel, section] = page.id.split('/');
  if (!section) return 'Settings';
  const parent = SETTINGS_PAGES.find(candidate => candidate.id === panel)!;
  return `${parent.title} settings`;
}

const PAGES = SETTINGS_PAGES.map(page => searchable({ page }, `setting:${page.id}`, page.title, page.keywords));

export class SettingsResults {
  constructor(private readonly close: () => void) {}

  find(search: Query, launches: (key: string) => number): Ranked[] {
    return rank(PAGES, search, BIAS, launches).slice(0, LIMIT).map(({ entry, score }) => ({ item: this.item(entry.page, entry.key), score }));
  }

  private item(page: SettingsPage, key: string): SearchItem {
    return {
      key, title: page.title, description: description(page),
      icon: themedIcon(page.symbol),
      activate: () => {
        launchHistory.record(key);
        this.close();
        openSettings(page.id);
      },
    };
  }
}
