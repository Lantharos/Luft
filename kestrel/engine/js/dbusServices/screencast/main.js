import {DBusService} from './dbusService.js';
import {ScreencastService} from './screencastService.js';

/** @returns {void} */
export async function main() {
    if (!ScreencastService.canScreencast())
        return;

    const service = new DBusService(
        'com.lantharos.Kestrel.Screencast',
        new ScreencastService());
    await service.runAsync();
}
