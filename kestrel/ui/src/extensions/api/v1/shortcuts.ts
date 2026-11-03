import { label } from '../../../portal/shortcuts/accelerators.js';
import { GrabbedShortcuts } from '../../runtime/shortcuts.js';
import type { ApiContext } from './context.js';
import type { Shortcuts } from './types.js';

export function shortcutsApi(context: ApiContext): Shortcuts {
  const { manifest, scope, host } = context;
  const handlers = new Map<string, Set<() => void>>();
  const known = (key: string) => {
    if (!manifest.shortcuts?.some(shortcut => shortcut.key === key)) throw new Error(`${key} isn't a shortcut in extension.toml`);
  };
  const grabbed = new GrabbedShortcuts(manifest.id, manifest, context.store, host.keybindings,
    context.fromPerson((key: string) => handlers.get(key)?.forEach(handler => handler())));
  context.shortcuts.current = grabbed;
  scope.disposable(() => {
    context.shortcuts.current = null;
    grabbed.destroy();
  });
  return {
    onActivated: (key, activated) => {
      known(key);
      const own = handlers.get(key) ?? new Set();
      handlers.set(key, own);
      own.add(activated);
      return scope.disposable(() => own.delete(activated));
    },
    label: key => {
      known(key);
      const [first] = grabbed.accelerators[key] ?? [];
      return first ? label(first) : null;
    },
  };
}
