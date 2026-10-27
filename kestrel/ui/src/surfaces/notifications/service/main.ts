import { DBusService } from '../../../shared/dbus/dbusService.js';
import { NotificationDaemon } from './notificationDaemon.js';

await new DBusService('com.lantharos.Kestrel.Notifications', new NotificationDaemon()).runAsync();
