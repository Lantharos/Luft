import Gio from 'gi://Gio';

import { onLocaleChanged, t } from '../../../shared/i18n/index.js';
import { launchHistory } from '../../../shared/launchHistory.js';
import { openSettings, SETTINGS_PAGES, type SettingsPage, settingsPageKeywords, settingsPageTitle } from '../../../system/settingsPages.js';
import { themedIcon } from '../icons.js';
import type { Ranked, SearchItem } from '../item.js';
import { rank, searchable, type Query, type Searchable } from '../ranking.js';

const LIMIT = 4;
const BIAS = 0.4;

function description(page: SettingsPage): string {
  const [panel, section] = page.id.split('/');
  if (!section) return t('start-search-settings-page');
  const parent = SETTINGS_PAGES.find(candidate => candidate.id === panel)!;
  return t('start-search-settings-section', { page: settingsPageTitle(parent, t) });
}

const copilotKeySeen = new Gio.Settings({ schema_id: 'com.lantharos.kestrel.copilot-key' }).get_boolean('seen');

export class SettingsResults {
  private pages: ({ page: SettingsPage } & Searchable)[] | null = null;

  constructor(private readonly close: () => void) {
    onLocaleChanged(() => (this.pages = null));
  }

  find(search: Query, launches: (key: string) => number): Ranked[] {
    this.pages ??= SETTINGS_PAGES.map(page => searchable({ page }, `setting:${page.id}`, settingsPageTitle(page, t), settingsPageKeywords(page, copilotKeySeen)));
    return rank(this.pages, search, BIAS, launches).slice(0, LIMIT).map(({ entry, score }) => ({ item: this.item(entry.page, entry.key), score }));
  }

  private item(page: SettingsPage, key: string): SearchItem {
    return {
      key, title: settingsPageTitle(page, t), description: description(page),
      icon: themedIcon(page.symbol),
      activate: () => {
        launchHistory.record(key);
        this.close();
        openSettings(page.id);
      },
    };
  }
}
