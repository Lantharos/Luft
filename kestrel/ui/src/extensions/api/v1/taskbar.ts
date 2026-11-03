import type St from 'gi://St';

import type { MenuEntry } from '../../../desktop/menus/contextMenus.js';
import { type TaskbarEntry, taskbarEntries } from '../../../desktop/panel/widgets/extensionItems.js';
import { t } from '../../../shared/i18n/index.js';
import type { ApiContext } from './context.js';
import { resolveIcon } from './icons.js';
import type { ActionItem, Taskbar, TaskbarItem, TaskbarItemOptions } from './types.js';

/** The button each taskbar item shows as, for pop-ups anchored to it. */
export const taskbarButtons = new WeakMap<TaskbarItem, () => St.Button | null>();

export function menuEntries(items: readonly ActionItem[], context: ApiContext): MenuEntry[] {
  return items.map((item): MenuEntry => {
    if (item === 'separator') return item;
    if (item === 'settings') return { label: t('extension-menu-settings', { name: context.name }), run: () => context.openSettings() };
    return { label: item.label, checked: item.checked, run: context.fromPerson(() => item.onActivate()) };
  });
}

export function taskbarApi(context: ApiContext): Taskbar {
  const { host, scope } = context;
  return {
    addItem: (options: TaskbarItemOptions) => {
      let state = { ...options };
      let icon = resolveIcon(context.path, state.icon);
      let button: St.Button | null = null;
      const listeners = new Set<() => void>();
      const openMenu = (from: St.Button) => {
        if (!state.menu?.length) return;
        const [x, y] = host.menus.anchorOf(from);
        host.menus.open(from, menuEntries(state.menu, context), x, y);
      };
      const entry: TaskbarEntry = {
        get icon() {
          return icon;
        },
        get label() {
          return state.label;
        },
        click: from => state.onClick ? context.fromPerson(state.onClick)() : openMenu(from),
        secondaryClick: openMenu,
        watch: changed => {
          listeners.add(changed);
          return () => listeners.delete(changed);
        },
        shown: shownAs => (button = shownAs),
      };
      const disposable = scope.disposable(taskbarEntries.add(entry));
      const item: TaskbarItem = {
        update: changes => {
          state = { ...state, ...changes };
          icon = resolveIcon(context.path, state.icon);
          for (const listener of [...listeners]) listener();
        },
        dispose: () => disposable.dispose(),
      };
      taskbarButtons.set(item, () => button);
      return item;
    },
  };
}
