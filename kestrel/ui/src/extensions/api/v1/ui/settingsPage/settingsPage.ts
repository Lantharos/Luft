import type { ApiContext } from '../../core/context.js';
import type { SettingsPage } from '../../types.js';
import { pageBuilder } from './serialize.js';

export function settingsPageApi(context: ApiContext): SettingsPage {
  const { scope, page, values, path, dataPath } = context;
  const settings = new Set(values.descriptions.map(setting => setting.key));
  return {
    describe: build => {
      const guarded = scope.guard(build);
      page.describe(() => {
        const sections = guarded();
        return sections ? pageBuilder([path, dataPath], settings, context.manifest.id)(sections) : null;
      }, context.fromPerson);
      return scope.disposable(() => page.describe(null, context.fromPerson));
    },
    refresh: () => page.changed(),
  };
}
