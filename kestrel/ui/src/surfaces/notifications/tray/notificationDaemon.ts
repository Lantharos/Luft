import { FdoNotificationDaemon } from '../daemon/fdoDaemon.js';
import { GtkNotificationDaemon } from '../daemon/gtkDaemon.js';

export class NotificationDaemon {
  readonly fdoNotificationDaemon = new FdoNotificationDaemon();
  readonly gtkNotificationDaemon = new GtkNotificationDaemon();
}
