import type Gio from 'gi://Gio';

import { Registry } from '../../../shared/registry.js';
import type { SearchGroup, SearchItem } from '../item.js';

const SHOWN = 5;

export interface FoundByExtension {
  title: string;
  description: string;
  icon: Gio.Icon;
  activate(): void;
}

/** Results an extension adds to Start's search, under its own title. */
export interface ExtensionProvider {
  readonly key: string;
  readonly title: string;
  search(text: string): Promise<FoundByExtension[]>;
}

export const extensionProviders = new Registry<ExtensionProvider>();

interface Found {
  text: string;
  items: SearchItem[];
}

export class ExtensionResults {
  private readonly found = new Map<ExtensionProvider, Found>();

  constructor(private readonly changed: () => void, private readonly close: () => void) {}

  lookUp(text: string, cancellable: Gio.Cancellable): void {
    for (const provider of extensionProviders.items) {
      void provider.search(text).then(results => {
        if (cancellable.is_cancelled()) return;
        this.found.set(provider, { text, items: results.slice(0, SHOWN).map((result, index) => this.item(provider, result, index)) });
        this.changed();
      });
    }
  }

  groups(text: string): SearchGroup[] {
    return extensionProviders.items.flatMap(provider => {
      const found = this.found.get(provider);
      return found?.text === text && found.items.length ? [{ title: provider.title, items: found.items }] : [];
    });
  }

  private item(provider: ExtensionProvider, result: FoundByExtension, index: number): SearchItem {
    return {
      key: `extension:${provider.key}:${index}:${result.title}`,
      title: result.title,
      description: result.description,
      icon: result.icon,
      activate: () => {
        this.close();
        result.activate();
      },
    };
  }
}
