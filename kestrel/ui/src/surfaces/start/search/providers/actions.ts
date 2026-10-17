import { launchHistory } from '../../../../shared/launchHistory.js';
import type { QuickControl, QuickSettingsSource } from '../../../quickSettings/quickControls.js';
import { LOCK, POWER_ACTIONS, isAvailable, type SessionAction } from '../../../quickSettings/sessionActions.js';
import { themedIcon } from '../icons.js';
import type { Ranked, SearchItem } from '../item.js';
import { rank, searchable, type Query, type Searchable } from '../ranking.js';

const LIMIT = 3;
const BIAS = 0.2;

interface Toggle {
  key: string;
  control: (source: QuickSettingsSource) => QuickControl | undefined;
  title: (on: boolean) => string;
  icon: string;
  keywords: string[];
}

const TOGGLES: Toggle[] = [
  {
    key: 'dark-style', control: source => source._darkMode.quickSettingsItems[0],
    title: on => on ? 'Switch to light style' : 'Switch to dark style', icon: 'dark-mode-symbolic',
    keywords: ['dark style', 'dark mode', 'dark theme', 'light style', 'light mode', 'light theme'],
  },
  {
    key: 'night-light', control: source => source._nightLight.quickSettingsItems[0],
    title: on => on ? 'Turn off night light' : 'Turn on night light', icon: 'night-light-symbolic',
    keywords: ['night light', 'night shift', 'blue light', 'warm colors'],
  },
  {
    key: 'do-not-disturb', control: source => source._doNotDisturb.quickSettingsItems[0],
    title: on => on ? 'Turn off Do Not Disturb' : 'Turn on Do Not Disturb', icon: 'notifications-disabled-symbolic',
    keywords: ['do not disturb', 'dnd', 'focus', 'quiet', 'silence notifications', 'mute notifications'],
  },
  {
    key: 'wifi', control: source => source._network?._wirelessToggle,
    title: on => on ? 'Turn off Wi-Fi' : 'Turn on Wi-Fi', icon: 'network-wireless-symbolic',
    keywords: ['wifi', 'wi-fi', 'wireless', 'wlan'],
  },
  {
    key: 'bluetooth', control: source => source._bluetooth?.quickSettingsItems[0],
    title: on => on ? 'Turn off Bluetooth' : 'Turn on Bluetooth', icon: 'bluetooth-active-symbolic',
    keywords: ['bluetooth'],
  },
  {
    key: 'airplane-mode', control: source => source._rfkill.quickSettingsItems[0],
    title: on => on ? 'Turn off airplane mode' : 'Turn on airplane mode', icon: 'airplane-mode-symbolic',
    keywords: ['airplane mode', 'flight mode', 'aeroplane mode', 'radios'],
  },
  {
    key: 'keep-awake', control: source => source._caffeine.quickSettingsItems[0],
    title: on => on ? 'Stop keeping awake' : 'Keep awake', icon: 'view-reveal-symbolic',
    keywords: ['keep awake', 'stay awake', 'caffeine', 'prevent sleep'],
  },
];

const SESSION_KEYWORDS = new Map<SessionAction, string[]>([
  [LOCK, ['lock screen', 'lock computer']],
  [POWER_ACTIONS[0], ['sleep', 'standby']],
  [POWER_ACTIONS[1], ['log out', 'logout', 'sign out', 'sign off', 'end session']],
  [POWER_ACTIONS[2], ['reboot', 'restart computer']],
  [POWER_ACTIONS[3], ['shut down', 'shutdown', 'turn off computer', 'power down']],
]);

function flip(control: QuickControl): void {
  if (control.toggle_mode) control.checked = !control.checked;
  else control.emit('clicked', 0);
}

interface ActionEntry extends Searchable {
  title: string;
  icon: string;
  run: () => void;
  shown: () => boolean;
}

function entry(key: string, title: string, icon: string, keywords: string[], run: () => void, shown: () => boolean): ActionEntry {
  return searchable({ title, icon, run, shown }, key, title, keywords);
}

function toggleEntries(toggle: Toggle, control: QuickControl): ActionEntry[] {
  const key = `action:${toggle.key}`;
  return [false, true].map(on =>
    entry(key, toggle.title(on), toggle.icon, toggle.keywords, () => flip(control), () => control.visible && control.checked === on));
}

const SESSION_ENTRIES = [...SESSION_KEYWORDS].map(([action, keywords]) =>
  entry(`action:${action.availability}`, action.label, action.icon, keywords, () => action.run(), () => isAvailable(action)));

export class ActionResults {
  private entries: ActionEntry[] = SESSION_ENTRIES;

  constructor(source: QuickSettingsSource, private readonly close: () => void) {
    source.ready.then(() => {
      const toggles = TOGGLES.flatMap(toggle => {
        const control = toggle.control(source);
        return control ? toggleEntries(toggle, control) : [];
      });
      this.entries = [...toggles, ...SESSION_ENTRIES];
    }).catch(error => console.error('Start could not read the quick settings', error));
  }

  find(search: Query, launches: (key: string) => number): Ranked[] {
    return rank(this.entries, search, BIAS, launches)
      .filter(({ entry }) => entry.shown())
      .slice(0, LIMIT)
      .map(({ entry, score }) => ({ item: this.item(entry), score }));
  }

  private item({ key, title, icon, run }: ActionEntry): SearchItem {
    return {
      key, title, description: '', icon: themedIcon(icon),
      activate: () => {
        launchHistory.record(key);
        this.close();
        run();
      },
    };
  }
}
