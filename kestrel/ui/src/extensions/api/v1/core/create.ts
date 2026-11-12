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
import { capabilityProperty, grantedCapabilities } from './granted.js';
import { chooseFiles, pickFiles, saveFile } from '../desktop/picking.js';
import { deleteFile, readText, writeText } from './files.js';
import { typingApi } from '../desktop/typing.js';
import { wallpaperApi } from '../visuals/wallpaper/wallpaper.js';
import { weatherApi } from '../services/weather.js';

const PARTS: { [Name in Capability]: (context: ApiContext) => Capabilities[Name] } = {
  'wallpaper': wallpaperApi,
  'quick-settings': quickSettingsApi,
  'taskbar': taskbarApi,
  'search': searchApi,
  'notifications': notificationsApi,
  'weather': weatherApi,
  'location': locationApi,
  'media': mediaApi,
  'popups': popupsApi,
  'typing': typingApi,
  'sounds': soundsApi,
  'audio-levels': audioLevelsApi,
  'calls': callsApi,
  'locked-sounds': lockedSoundsApi,
  'input-sounds': inputSoundsApi,
  'do-not-disturb': doNotDisturbApi,
  'screen-effects': screenEffectsApi,
  'clipboard': clipboardApi,
  'file-actions': fileActionsApi,
  'helper': helperApi,
  'shortcuts': shortcutsApi,
  'network': networkApi,
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
  const extension = Object.defineProperties({}, Object.getOwnPropertyDescriptors(basics)) as Basics & Record<string, unknown>;
  for (const capability of grantedCapabilities(manifest)) extension[capabilityProperty(capability)] = PARTS[capability](context);
  return Object.freeze(extension);
}
