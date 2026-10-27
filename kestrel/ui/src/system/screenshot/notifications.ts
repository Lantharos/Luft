import Gio from 'gi://Gio';

import * as KestrelUi from '../../kestrelUi.js';
import * as Main from '../../core/main.js';
import * as MessageTray from '../../surfaces/notifications/tray/messageTray.js';

let source: MessageTray.Source | null = null;

export function screenshotNotificationSource(): MessageTray.Source {
  if (source) return source;

  const created = new MessageTray.Source({ iconName: 'screenshooter-symbolic' });
  KestrelUi.localized(created, () => (created.title = KestrelUi.t('screenshot-source')));
  created.connect('destroy', () => {
    source = null;
  });
  Main.messageTray.add(created);
  source = created;
  return created;
}

export function addShowInFilesAction(notification: MessageTray.Notification, file: Gio.File): void {
  notification.addAction(KestrelUi.t('screenshot-show-in-rover'), () => {
    const app = Gio.app_info_get_default_for_type('inode/directory', false);
    if (app === null) {
      log('Error showing in files: no default app set for inode/directory');
      return;
    }

    app.launch([file], global.create_app_launch_context(0, -1));
  });
}

export function openFile(file: Gio.File): void {
  try {
    Gio.app_info_launch_default_for_uri(file.get_uri(), global.create_app_launch_context(0, -1));
  } catch (error) {
    logError(error as object, `Error opening ${file.get_uri()}`);
  }
}
