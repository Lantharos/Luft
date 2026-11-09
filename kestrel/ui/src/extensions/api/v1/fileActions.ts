import { type FileActionChoiceShape, type FileActionEntry, fileActions, iconFile } from '../../fileActions/actions.js';
import type { ApiContext } from './context.js';
import { resolveIcon } from './icons.js';
import type { FileAction, FileActionItem, FileActionOptions, FileActions } from './types.js';

const KEY = /^[a-z][a-z0-9-]*$/;
const SEPARATOR: FileActionChoiceShape = { key: '', label: '', icon: '', disabled: true, keepsMenuOpen: false, separator: true };

export function fileActionsApi(context: ApiContext): FileActions {
  const { scope, manifest, path } = context;
  const icon = (name: string) => iconFile(resolveIcon(path, name));
  const choice = (item: FileActionItem): FileActionChoiceShape => item === 'separator' ? SEPARATOR : {
    key: item.key, label: item.label, icon: item.icon ? icon(item.icon) : '', disabled: !!item.disabled,
    keepsMenuOpen: !!item.keepsMenuOpen, separator: false,
  };
  return {
    add: (options: FileActionOptions): FileAction => {
      if (!KEY.test(options.key)) throw new Error(`${options.key} isn't a lowercase key with dashes`);
      let state = { ...options };
      let shownIcon = icon(state.icon);
      const listeners = new Set<() => void>();
      const changed = () => {
        for (const listener of [...listeners]) listener();
      };
      const entry: FileActionEntry = {
        id: `${manifest.id}/${options.key}`,
        shape: () => {
          if (state.shown === false) return null;
          const items = state.items && (scope.run(state.items) ?? []);
          return {
            label: state.label,
            icon: shownIcon,
            kind: state.on?.kind ?? 'any',
            types: state.on?.types ?? [],
            extensions: state.on?.extensions ?? [],
            multiple: state.on?.multiple !== false,
            items: items ? items.map(choice) : null,
            sends: !!state.sends,
          };
        },
        opened: () => {
          if (state.onOpened) scope.run(state.onOpened);
        },
        activate: context.fromPerson((paths: string[], chosen: string) => state.onActivate(paths, chosen || undefined)),
        watch: listener => {
          listeners.add(listener);
          return () => listeners.delete(listener);
        },
      };
      const disposable = scope.disposable(fileActions.add(entry));
      return {
        update: changes => {
          state = { ...state, ...changes };
          shownIcon = icon(state.icon);
          changed();
        },
        refresh: changed,
        dispose: () => disposable.dispose(),
      };
    },
  };
}
