import {DBusService} from '../dbusService.js';
import {ScreencastService} from './screencastService.js';

if (ScreencastService.canScreencast())
    await new DBusService('com.lantharos.Kestrel.Screencast', new ScreencastService()).runAsync();
