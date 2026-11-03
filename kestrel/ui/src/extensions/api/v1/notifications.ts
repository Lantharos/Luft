import * as Main from '../../../core/main.js';
import * as MessageTray from '../../../surfaces/notifications/tray/messageTray.js';
import type { ApiContext } from './context.js';
import { resolveIcon } from './icons.js';
import type { NotificationOptions, Notifications } from './types.js';

const SOURCE_ICON = 'application-x-addon-symbolic';

export function notificationsApi(context: ApiContext): Notifications {
  const { scope } = context;
  let source: MessageTray.Source | null = null;
  const sourceFor = (): MessageTray.Source => {
    if (source) return source;
    const created = source = new MessageTray.Source({ title: context.name, iconName: SOURCE_ICON });
    created.connect('destroy', () => {
      if (source === created) source = null;
    });
    Main.messageTray.add(created);
    scope.disposable(() => created.destroy());
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
      if (options.onActivate) notification.connect('activated', scope.guard(options.onActivate));
      for (const action of options.actions ?? []) notification.addAction(action.label, scope.guard(() => action.onActivate()));
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
