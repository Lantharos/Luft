import {DBusService} from './dbusService.js';
import {NotificationDaemon} from './notificationDaemon.js';

/** @returns {void} */
export async function main() {
    const service = new DBusService(
        'com.lantharos.Kestrel.Notifications',
        new NotificationDaemon());
    await service.runAsync();
}
