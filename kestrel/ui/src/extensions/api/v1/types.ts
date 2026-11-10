import type { ScreenEffects } from './types/screenEffects.js';
import type { Wallpaper } from './types/wallpaper.js';
import type { Popups, QuickSettings, Taskbar } from './types/surfaces.js';
import type { AudioLevels, Calls, InputSounds, LockedSounds, Shortcuts, Sounds, Typing } from './types/inputAndSound.js';
import type { Clipboard, DoNotDisturb, FileActions, Helper, Location, Media, Network, Notifications, Search, Weather } from './types/services.js';

/** Something an extension made that it, or Kestrel when the extension is turned off, can take away again. */
export interface Disposable {
  dispose(): void;
}

/**
 * What an extension may use beyond the basics, listed under `permissions` in its manifest. Settings and the store
 * show each one in plain words:
 *
 * - `wallpaper`: Draw over the wallpaper
 * - `quick-settings`: Add tiles to quick settings
 * - `taskbar`: Add buttons to the taskbar
 * - `search`: Add results to search
 * - `notifications`: Send notifications
 * - `weather`: See the weather where you are
 * - `location`: See roughly where you are
 * - `media`: See and control what's playing
 * - `popups`: Show panels and small windows
 * - `typing`: Type into other apps
 * - `sounds`: Play sounds
 * - `audio-levels`: Follow the beat of what's playing
 * - `calls`: Know when you're in a call
 * - `locked-sounds`: Keep playing sounds while the screen is locked
 * - `input-sounds`: Play a sound when you type and click, without seeing your keys
 * - `do-not-disturb`: Hold back notifications for a while
 * - `screen-effects`: Draw over and change how your windows and the whole screen look
 * - `clipboard`: Copy to your clipboard
 * - `file-actions`: Add to the menu of files and folders in Rover
 */
export type Permission =
  | 'wallpaper' | 'quick-settings' | 'taskbar' | 'search' | 'notifications' | 'weather' | 'location' | 'media'
  | 'popups' | 'typing' | 'sounds' | 'audio-levels' | 'calls' | 'locked-sounds' | 'input-sounds' | 'do-not-disturb' | 'screen-effects'
  | 'clipboard' | 'file-actions';

/**
 * A permission, `helper` for an extension whose manifest declares a native helper, `shortcuts` for one that declares
 * keyboard shortcuts, or `network` for one that names the hosts it connects to.
 */
export type Capability = Permission | 'helper' | 'shortcuts' | 'network';

/** The part of the API each capability unlocks, by the name it has on {@link Extension}. */
export interface Capabilities {
  wallpaper: Wallpaper;
  'quick-settings': QuickSettings;
  taskbar: Taskbar;
  search: Search;
  notifications: Notifications;
  weather: Weather;
  location: Location;
  media: Media;
  popups: Popups;
  typing: Typing;
  sounds: Sounds;
  'audio-levels': AudioLevels;
  calls: Calls;
  'locked-sounds': LockedSounds;
  'input-sounds': InputSounds;
  'do-not-disturb': DoNotDisturb;
  'screen-effects': ScreenEffects;
  clipboard: Clipboard;
  'file-actions': FileActions;
  helper: Helper;
  shortcuts: Shortcuts;
  network: Network;
}

export * from './types/screenEffects.js';
export * from './types/basics.js';
export * from './types/wallpaper.js';
export * from './types/surfaces.js';
export * from './types/inputAndSound.js';
export * from './types/services.js';
export * from './types/settingsPage.js';
