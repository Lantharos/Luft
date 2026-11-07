import type Clutter from 'gi://Clutter';
import type St from 'gi://St';

import type { MenuEntry } from '../../../../desktop/menus/contextMenus.js';
import { taskbarElements } from '../../../../desktop/panel/elements/extensionElements.js';
import { type TaskbarEntry, taskbarEntries } from '../../../../desktop/panel/widgets/extensionItems.js';
import { t } from '../../../../shared/i18n/index.js';
import type { ApiContext } from '../context.js';
import { resolveIcon } from '../icons.js';
import type { ActionItem, Taskbar, TaskbarElement, TaskbarElementOptions, TaskbarItem, TaskbarItemOptions } from '../types.js';
import { type ElementState, ElementWidget } from './element.js';

const KEY = /^[a-z][a-z0-9-]*$/;

/** What each taskbar item or element shows as, for pop-ups anchored to it: the one people used last. */
export const taskbarAnchors = new WeakMap<TaskbarItem | TaskbarElement, () => Clutter.Actor | null>();

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
      taskbarAnchors.set(item, () => button);
      return item;
    },
    addElement: (options: TaskbarElementOptions) => addElement(context, options),
  };
}

function addElement(context: ApiContext, options: TaskbarElementOptions): TaskbarElement {
  const { host, scope, manifest, path, dataPath } = context;
  if (!KEY.test(options.key)) throw new Error(`${options.key} isn't a lowercase key with dashes`);
  let state = { ...options };
  const current = (): ElementState => ({
    shown: state.shown !== false, content: state.content, expanded: state.expanded ?? null, takesFiles: !!state.onDrop,
  });
  const widgets = new Set<ElementWidget>();
  const listeners = new Set<() => void>();
  let lastUsed: Clutter.Actor | null = null;
  const controls = { folders: [path, dataPath], extensionPath: path, act: (run: () => void) => context.fromPerson(run)() };
  const handlers = {
    run: <Result>(build: () => Result) => scope.run(build),
    click: (actor: Clutter.Actor) => {
      lastUsed = actor;
      if (state.onClick) context.fromPerson(state.onClick)();
    },
    drop: (paths: string[]) => {
      if (state.onDrop && paths.length) context.fromPerson(state.onDrop)(paths);
    },
    expanded: (expanded: boolean) => {
      if (state.onExpandedChanged) scope.run(() => state.onExpandedChanged!(expanded));
    },
    menu: (actor: Clutter.Actor) => {
      lastUsed = actor;
      if (!state.menu?.length) return;
      const [x, y] = host.menus.anchorOf(actor);
      host.menus.open(actor, menuEntries(state.menu, context), x, y);
    },
  };
  const disposable = scope.disposable(taskbarElements.add({
    id: `${manifest.id}/${options.key}`,
    get label() {
      return state.label;
    },
    create: layout => {
      const widget = new ElementWidget(current, controls, handlers, layout);
      widgets.add(widget);
      widget.actor.accessible_name = state.label;
      widget.actor.name = `extension-element:${manifest.id}/${options.key}`;
      widget.actor.connect('notify::hover', () => (lastUsed = widget.actor));
      widget.actor.connect('destroy', () => {
        widgets.delete(widget);
        if (lastUsed === widget.actor) lastUsed = null;
      });
      return widget;
    },
    watch: changed => {
      listeners.add(changed);
      return () => listeners.delete(changed);
    },
  }));
  const element: TaskbarElement = {
    update: changes => {
      state = { ...state, ...changes };
      for (const widget of widgets) {
        widget.actor.accessible_name = state.label;
        widget.refresh();
      }
      for (const listener of [...listeners]) listener();
    },
    refresh: () => widgets.forEach(widget => widget.refresh()),
    dispose: () => disposable.dispose(),
  };
  taskbarAnchors.set(element, () => lastUsed?.mapped ? lastUsed : [...widgets].find(widget => widget.actor.mapped)?.actor ?? null);
  return element;
}
