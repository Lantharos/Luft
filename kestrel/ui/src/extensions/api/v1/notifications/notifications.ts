import * as Main from '../../../../core/main.js';
import * as MessageTray from '../../../../surfaces/notifications/tray/messageTray.js';
import type { ApiContext } from '../context.js';
import { resolveIcon } from '../icons.js';
import type { NotificationOptions, Notifications } from '../types.js';

const SOURCE_ICON = 'application-x-addon-symbolic';

/** Which extension sent through each source, so its own notifications pass its holds. */
export const sourceOwners = new WeakMap<MessageTray.Source, string>();

export function notificationsApi(context: ApiContext): Notifications {
  const { scope } = context;
  let source: MessageTray.Source | null = null;
  const sourceFor = (): MessageTray.Source => {
    if (source) return source;
    const created = source = new MessageTray.Source({ title: context.name, iconName: SOURCE_ICON });
    sourceOwners.set(created, context.manifest.id);
    let alive = true;
    created.connect('destroy', () => {
      alive = false;
      if (source === created) source = null;
    });
    scope.disposable(() => {
      if (alive) created.destroy();
    });
    Main.messageTray.add(created);
    return created;
  };
  return {
    send: (options: NotificationOptions) => {
      const notification = new MessageTray.Notification({
        source: sourceFor(),
        title: options.title,
        body: options.body ?? '',
        gicon: options.icon ? resolveIcon(context.path, options.icon) : null,
        urgency: options.urgent ? MessageTray.Urgency.CRITICAL : MessageTray.Urgency.NORMAL,
      });
      if (options.onActivate) notification.connect('activated', context.fromPerson(options.onActivate));
      for (const action of options.actions ?? []) notification.addAction(action.label, context.fromPerson(() => action.onActivate()));
      let shown = true;
      const handle = scope.disposable(() => {
        if (shown) notification.destroy();
      });
      notification.connect('destroy', () => {
        shown = false;
        handle.dispose();
      });
      notification.source!.addNotification(notification);
      return handle;
    },
  };
}
