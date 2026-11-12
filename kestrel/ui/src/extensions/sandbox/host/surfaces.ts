import type { Notifications, Popup, Popups, QuickSettings, Search, Taskbar, TaskbarElement, TaskbarItem, Toggle } from '../../api/v1/types.js';
import { type HostContext, made, watching } from './basics.js';

function thing<Extra extends object>({ link, scope }: HostContext, path: string, options: object, extra: (ref: number) => Extra, state?: (state: Record<string, unknown>) => void) {
  const ref = link.make(path, [options], state);
  const handle = scope.disposable(() => link.end(ref));
  return link.adopt(ref, {
    update: (changes: object) => link.update(ref, changes as Record<string, unknown>),
    dispose: () => handle.dispose(),
    ...extra(ref),
  });
}

export const quickSettingsApi = (context: HostContext): QuickSettings => ({
  addToggle: options => thing(context, 'quickSettings.addToggle', options, () => ({})) as Toggle,
});

export const taskbarApi = (context: HostContext): Taskbar => ({
  addItem: options => thing(context, 'taskbar.addItem', options, () => ({})) as TaskbarItem,
  addElement: options => thing(context, 'taskbar.addElement', { ...options, onDrop: undefined }, ref => ({
    refresh: () => context.link.method(ref, 'refresh'),
  })) as TaskbarElement,
});

export function popupsApi(context: HostContext): Popups {
  const { link, scope } = context;
  return {
    open: ({ onClosed, ...options }) => {
      let open = true;
      const closed = () => {
        if (!open) return;
        open = false;
        link.forget(ref);
        handle.dispose();
        if (onClosed) scope.run(onClosed);
      };
      const ref = link.make('popups.open', [{ ...options, onClosed: closed }]);
      const handle = scope.disposable(() => {
        if (open) link.end(ref);
        open = false;
      });
      const popup: Popup = {
        get open() {
          return open;
        },
        update: content => {
          if (open) link.method(ref, 'update', [content], `${ref}.content`);
        },
        dispose: () => handle.dispose(),
      };
      return popup;
    },
  };
}

export function notificationsApi(context: HostContext): Notifications {
  return {
    send: options => made(context, 'notifications.send', [options]),
    get heldBack() {
      return context.link.mirror<{ heldBack: boolean }>('notifications').heldBack;
    },
    onHeldBackChanged: watching(context, 'notifications'),
  };
}

export const searchApi = (context: HostContext): Search => ({
  addProvider: provider => made(context, 'search.addProvider', [provider]),
});
