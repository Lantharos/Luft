import { DBusService } from '../dbusService.js';
import { canScreencast } from './pipelines.js';
import { ScreencastService } from './screencastService.js';

if (canScreencast()) await new DBusService('com.lantharos.Kestrel.Screencast', new ScreencastService()).runAsync();
