import * as KestrelUi from '../../../kestrelUi.js';
import * as Main from '../../main.js';
import * as MessageTray from '../../notifications/messageTray.js';

export class CaptivePortalHandler {
  private readonly signingIn = new Set<string>();
  private readonly notifications = new Map<string, MessageTray.Notification>();

  constructor(private readonly checkUri: string) {}

  addConnection(name: string, path: string): void {
    if (this.signingIn.has(path) || this.notifications.has(path)) return;

    const source = MessageTray.getSystemSource();
    const notification = new MessageTray.Notification({
      title: KestrelUi.t('network-menu-sign-in'),
      body: name,
      source,
    });
    notification.connect('activated', () => {
      this.signingIn.add(path);
      KestrelUi.signInToNetwork(name, this.checkUri);
      Main.closeShellPopups();
    });
    notification.connect('destroy', () => this.notifications.delete(path));
    this.notifications.set(path, notification);
    source.addNotification(notification);
  }

  clear(): void {
    this.signingIn.clear();
    for (const notification of this.notifications.values())
      notification.destroy(MessageTray.NotificationDestroyedReason.SOURCE_CLOSED);
    this.notifications.clear();
  }
}
