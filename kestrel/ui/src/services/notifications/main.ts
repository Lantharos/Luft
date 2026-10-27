import { DBusService } from '../dbusService.js';
import { NotificationDaemon } from './notificationDaemon.js';

await new DBusService('com.lantharos.Kestrel.Notifications', new NotificationDaemon()).runAsync();
