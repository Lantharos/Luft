import type { SearchResult } from '@luft/extension-api';

import { ICON } from './element.js';
import type { Pult } from './pult.js';

const SHORTEST = 2;

/** Pult's items in Start's search, while signed in. */
export function addSearch(pult: Pult): void {
  const { extension } = pult;
  extension.search.addProvider({
    title: extension.t('search-title'),
    search: async (query): Promise<SearchResult[]> => {
      if (!pult.client.signedIn || query.trim().length < SHORTEST) return [];
      const items = await pult.client.find(query.trim());
      return items.map(item => ({
        title: item.title,
        description: `${item.inboxLabel} · ${item.place.project.name}`,
        icon: ICON,
        activate: () => extension.open(item.url),
      }));
    },
  });
}
