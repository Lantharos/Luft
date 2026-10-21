import Gio from 'gi://Gio';
import type Shell from 'gi://Shell';

import { t } from '../../../shared/i18n/index.js';
import { themedIcon } from '../icons.js';
import type { SearchItem } from '../item.js';

const ENGINES: Record<string, { name: string; address: string }> = {
  duckduckgo: { name: 'DuckDuckGo', address: 'https://duckduckgo.com/?q=' },
  google: { name: 'Google', address: 'https://www.google.com/search?q=' },
  bing: { name: 'Bing', address: 'https://www.bing.com/search?q=' },
  brave: { name: 'Brave Search', address: 'https://search.brave.com/search?q=' },
  ecosia: { name: 'Ecosia', address: 'https://www.ecosia.org/search?q=' },
  startpage: { name: 'Startpage', address: 'https://www.startpage.com/do/search?q=' },
  kagi: { name: 'Kagi', address: 'https://kagi.com/search?q=' },
};

export class WebSearch {
  private readonly settings = new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });

  constructor(private readonly close: () => void) {}

  item(text: string): SearchItem {
    const engine = ENGINES[this.settings.get_string('search-web-engine')] ?? ENGINES.duckduckgo;
    return {
      key: 'web', title: t('start-search-web', { query: text }), description: engine.name, icon: themedIcon('web-browser-symbolic'),
      activate: () => {
        this.close();
        Gio.AppInfo.launch_default_for_uri_async(`${engine.address}${encodeURIComponent(text)}`,
          (global as unknown as Shell.Global).create_app_launch_context(0, -1), null, (_source, result) => {
            try {
              Gio.AppInfo.launch_default_for_uri_finish(result);
            } catch (error) {
              console.warn(`The web search could not be opened: ${error}`);
            }
          });
      },
    };
  }
}
