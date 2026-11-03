import GLib from 'gi://GLib';

import { appearanceApi, open, sessionApi, settingsApi, storageApi, timersApi } from './basics.js';
import type { ApiContext } from './context.js';
import { helperApi } from './helper.js';
import { locationApi } from './location.js';
import { mediaApi } from './media/media.js';
import { notificationsApi } from './notifications.js';
import { quickSettingsApi } from './quickSettings/quickSettings.js';
import { audioLevelsApi } from './audio/levels.js';
import { soundsApi } from './audio/sounds.js';
import { popupsApi } from './popups/popups.js';
import { searchApi } from './search.js';
import { settingsPageApi } from './settingsPage/settingsPage.js';
import { shortcutsApi } from './shortcuts.js';
import { desktopApi, powerApi } from './system.js';
import { taskbarApi } from './taskbar/taskbar.js';
import type { Basics, Capabilities, Capability } from './types.js';
import { typingApi } from './typing.js';
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
  'popups': { property: 'popups', create: popupsApi },
  'typing': { property: 'typing', create: typingApi },
  'sounds': { property: 'sounds', create: soundsApi },
  'audio-levels': { property: 'audioLevels', create: audioLevelsApi },
  'helper': { property: 'helper', create: helperApi },
  'shortcuts': { property: 'shortcuts', create: shortcutsApi },
};

/** The object an extension gets: the basics, plus exactly what its manifest asked for. */
export function createApi(context: ApiContext): Readonly<Basics & Record<string, unknown>> {
  const { manifest, scope, translations } = context;
  const basics: Basics = {
    id: manifest.id,
    version: manifest.version,
    path: context.path,
    get dataPath() {
      GLib.mkdir_with_parents(context.dataPath, 0o700);
      return context.dataPath;
    },
    settings: settingsApi(context),
    settingsPage: settingsPageApi(context),
    storage: storageApi(context),
    timers: timersApi(context),
    session: sessionApi(context),
    desktop: desktopApi(context),
    power: powerApi(context),
    appearance: appearanceApi(context),
    t: (id, args) => translations.t(id, args),
    open,
    openSettings: () => context.openSettings(),
    onDisable: cleanup => scope.onDisable(cleanup),
  };
  const granted: Capability[] = [
    ...manifest.permissions ?? [], ...manifest.helper ? ['helper' as const] : [], ...manifest.shortcuts?.length ? ['shortcuts' as const] : [],
  ];
  const extension = Object.defineProperties({}, Object.getOwnPropertyDescriptors(basics)) as Basics & Record<string, unknown>;
  for (const capability of granted) extension[PARTS[capability].property] = PARTS[capability].create(context);
  return Object.freeze(extension);
}
