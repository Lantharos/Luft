import GLib from 'gi://GLib';

import { appearanceApi } from './appearance.js';
import { open, sessionApi, settingsApi, storageApi, timersApi } from './basics.js';
import type { ApiContext } from './context.js';
import { helperApi } from './helper.js';
import { locationApi } from './location.js';
import { mediaApi } from './media/media.js';
import { doNotDisturbApi } from './notifications/doNotDisturb.js';
import { notificationsApi } from './notifications/notifications.js';
import { networkApi } from './network.js';
import { peersApi } from './peers.js';
import { quickSettingsApi } from './quickSettings/quickSettings.js';
import { audioLevelsApi } from './audio/levels.js';
import { inputSoundsApi } from './audio/inputSounds.js';
import { lockedSoundsApi, soundsApi } from './audio/sounds.js';
import { callsApi } from './calls.js';
import { clipboardApi } from './clipboard.js';
import { popupsApi } from './popups/popups.js';
import { screenEffectsApi } from './screenEffects/screenEffects.js';
import { searchApi } from './search.js';
import { secretsApi } from './secrets.js';
import { settingsPageApi } from './settingsPage/settingsPage.js';
import { shortcutsApi } from './shortcuts.js';
import { desktopApi, powerApi } from './system.js';
import { taskbarApi } from './taskbar/taskbar.js';
import type { Basics, Capabilities, Capability } from './types.js';
import { chooseFiles, deleteFile, pickFiles, readText, saveFile, writeText } from './picking.js';
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
  'calls': { property: 'calls', create: callsApi },
  'locked-sounds': { property: 'lockedSounds', create: lockedSoundsApi },
  'input-sounds': { property: 'inputSounds', create: inputSoundsApi },
  'do-not-disturb': { property: 'doNotDisturb', create: doNotDisturbApi },
  'screen-effects': { property: 'screenEffects', create: screenEffectsApi },
  'clipboard': { property: 'clipboard', create: clipboardApi },
  'helper': { property: 'helper', create: helperApi },
  'shortcuts': { property: 'shortcuts', create: shortcutsApi },
  'network': { property: 'network', create: networkApi },
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
    secrets: secretsApi(context),
    peers: peersApi(context),
    timers: timersApi(context),
    session: sessionApi(context),
    desktop: desktopApi(context),
    power: powerApi(context),
    appearance: appearanceApi(context),
    t: (id, args) => translations.t(id, args),
    open,
    openSettings: () => context.openSettings(),
    pickFiles: options => pickFiles(context, options),
    chooseFiles: options => chooseFiles(context, options),
    deleteFile: path => deleteFile(context, path),
    readText: path => readText(context, path),
    writeText: async (path, text) => {
      await writeText(context, path, text);
    },
    saveFile: options => saveFile(context, options),
    onDisable: cleanup => scope.onDisable(cleanup),
  };
  const granted: Capability[] = [
    ...manifest.permissions ?? [], ...manifest.helper ? ['helper' as const] : [], ...manifest.shortcuts?.length ? ['shortcuts' as const] : [],
    ...manifest.network?.hosts.length ? ['network' as const] : [],
  ];
  const extension = Object.defineProperties({}, Object.getOwnPropertyDescriptors(basics)) as Basics & Record<string, unknown>;
  for (const capability of granted) extension[PARTS[capability].property] = PARTS[capability].create(context);
  return Object.freeze(extension);
}
