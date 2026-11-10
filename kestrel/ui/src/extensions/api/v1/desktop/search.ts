import { type ExtensionProvider, extensionProviders, type FoundByExtension } from '../../../../surfaces/search/providers/extensions.js';
import type { ApiContext } from '../core/context.js';
import { resolveIcon } from './icons.js';
import type { Search, SearchProvider, SearchResult } from '../types.js';

const FALLBACK_ICON = 'system-search-symbolic';

export function searchApi(context: ApiContext): Search {
  const { scope, manifest, path } = context;
  let added = 0;
  const found = (result: SearchResult): FoundByExtension => ({
    title: result.title,
    description: result.description ?? '',
    icon: resolveIcon(path, result.icon ?? FALLBACK_ICON),
    activate: context.fromPerson(() => result.activate()),
  });
  return {
    addProvider: (provider: SearchProvider) => {
      const entry: ExtensionProvider = {
        key: `${manifest.id}/${added++}`,
        title: provider.title,
        search: async text => {
          try {
            return (await scope.run(() => provider.search(text)) ?? []).map(found);
          } catch {
            return [];
          }
        },
      };
      return scope.disposable(extensionProviders.add(entry));
    },
  };
}
