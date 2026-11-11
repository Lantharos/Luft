import GLib from 'gi://GLib';

import { appearanceApi } from '../desktop/appearance.js';
import { sessionApi, settingsApi, storageApi, timersApi } from './basics.js';
import { opener } from './opening.js';
import type { ApiContext } from './context.js';
import { helperApi } from './helper.js';
import { locationApi } from '../services/location.js';
import { mediaApi } from '../sound/media/media.js';
import { doNotDisturbApi } from '../ui/notifications/doNotDisturb.js';
import { notificationsApi } from '../ui/notifications/notifications.js';
import { networkApi } from '../services/network.js';
import { peersApi } from './peers.js';
import { quickSettingsApi } from '../ui/quickSettings/quickSettings.js';
import { audioLevelsApi } from '../sound/audio/levels.js';
import { inputSoundsApi } from '../sound/audio/inputSounds.js';
import { lockedSoundsApi, soundsApi } from '../sound/audio/sounds.js';
import { callsApi } from '../desktop/calls.js';
import { clipboardApi } from '../desktop/clipboard.js';
import { fileActionsApi } from '../desktop/fileActions.js';
import { popupsApi } from '../ui/popups/popups.js';
import { screenEffectsApi } from '../visuals/screenEffects/screenEffects.js';
import { searchApi } from '../desktop/search.js';
import { secretsApi } from '../services/secrets.js';
import { settingsPageApi } from '../ui/settingsPage/settingsPage.js';
import { shortcutsApi } from '../desktop/shortcuts.js';
import { desktopApi, powerApi } from '../desktop/system.js';
import { taskbarApi } from '../ui/taskbar/taskbar.js';
import type { Basics, Capabilities, Capability } from '../types.js';
import { chooseFiles, deleteFile, pickFiles, readText, saveFile, writeText } from '../desktop/picking.js';
import { typingApi } from '../desktop/typing.js';
import { wallpaperApi } from '../visuals/wallpaper/wallpaper.js';
import { weatherApi } from '../services/weather.js';

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
  'file-actions': { property: 'fileActions', create: fileActionsApi },
  'helper': { property: 'helper', create: helperApi },
  'shortcuts': { property: 'shortcuts', create: shortcutsApi },
  'network': { property: 'network', create: networkApi },
};

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
    open: opener(context),
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
