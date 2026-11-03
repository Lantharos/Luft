import { appearanceApi, sessionApi, settingsApi, timersApi } from './basics.js';
import type { ApiContext } from './context.js';
import { helperApi } from './helper.js';
import { locationApi } from './location.js';
import { mediaApi } from './media.js';
import { notificationsApi } from './notifications.js';
import { quickSettingsApi } from './quickSettings/quickSettings.js';
import { searchApi } from './search.js';
import { taskbarApi } from './taskbar.js';
import type { Basics, Capabilities, Capability } from './types.js';
import { wallpaperApi } from './wallpaper/wallpaper.js';
import { weatherApi } from './weather.js';

const PARTS: { [Name in Capability]: { property: string; create(context: ApiContext): Capabilities[Name] } } = {
  'wallpaper': { property: 'wallpaper', create: wallpaperApi },
  'quick-settings': { property: 'quickSettings', create: quickSettingsApi },
  'taskbar': { property: 'taskbar', create: taskbarApi },
  'search': { property: 'search', create: searchApi },
  'notifications': { property: 'notifications', create: notificationsApi },
  'weather': { property: 'weather', create: weatherApi },
  'location': { property: 'location', create: locationApi },
  'media': { property: 'media', create: mediaApi },
  'helper': { property: 'helper', create: helperApi },
};

/** The object an extension gets: the basics, plus exactly what its manifest asked for. */
export function createApi(context: ApiContext): Readonly<Basics & Record<string, unknown>> {
  const { manifest, scope, translations } = context;
  const basics: Basics = {
    id: manifest.id,
    version: manifest.version,
    path: context.path,
    settings: settingsApi(context),
    timers: timersApi(context),
    session: sessionApi(context),
    appearance: appearanceApi(context),
    t: (id, args) => translations.t(id, args),
    onDisable: cleanup => scope.onDisable(cleanup),
  };
  const granted: Capability[] = [...manifest.permissions ?? [], ...manifest.helper ? ['helper' as const] : []];
  const extension: Basics & Record<string, unknown> = { ...basics };
  for (const capability of granted) extension[PARTS[capability].property] = PARTS[capability].create(context);
  return Object.freeze(extension);
}
