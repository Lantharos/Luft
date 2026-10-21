import { t } from '../../../shared/i18n/index.js';
import { launchHistory } from '../../../shared/apps/launchHistory.js';
import type { QuickControl, QuickSettingsSource } from '../../quickSettings/quickControls.js';
import { LOCK, POWER_ACTIONS, isAvailable, type SessionAction } from '../../quickSettings/sessionActions.js';
import { themedIcon } from '../icons.js';
import type { Ranked, SearchItem } from '../item.js';
import { rank, searchable, type Query, type Searchable } from '../ranking.js';

const LIMIT = 3;
const BIAS = 0.2;

interface Toggle {
  key: string;
  control: (source: QuickSettingsSource) => QuickControl | undefined;
  turnOn: string;
  turnOff: string;
  keywords: string;
  icon: string;
}

const TOGGLES: Toggle[] = [
  {
    key: 'dark-style', control: source => source._darkMode.quickSettingsItems[0], icon: 'dark-mode-symbolic',
    turnOn: 'start-search-dark-style-on', turnOff: 'start-search-dark-style-off', keywords: 'start-search-dark-style-keywords',
  },
  {
    key: 'night-light', control: source => source._nightLight.quickSettingsItems[0], icon: 'night-light-symbolic',
    turnOn: 'start-search-night-light-on', turnOff: 'start-search-night-light-off', keywords: 'start-search-night-light-keywords',
  },
  {
    key: 'do-not-disturb', control: source => source._doNotDisturb.quickSettingsItems[0], icon: 'notifications-disabled-symbolic',
    turnOn: 'start-search-do-not-disturb-on', turnOff: 'start-search-do-not-disturb-off', keywords: 'start-search-do-not-disturb-keywords',
  },
  {
    key: 'wifi', control: source => source._network?._wirelessToggle, icon: 'network-wireless-symbolic',
    turnOn: 'start-search-wifi-on', turnOff: 'start-search-wifi-off', keywords: 'start-search-wifi-keywords',
  },
  {
    key: 'bluetooth', control: source => source._bluetooth?.quickSettingsItems[0], icon: 'bluetooth-active-symbolic',
    turnOn: 'start-search-bluetooth-on', turnOff: 'start-search-bluetooth-off', keywords: 'start-search-bluetooth-keywords',
  },
  {
    key: 'airplane-mode', control: source => source._rfkill.quickSettingsItems[0], icon: 'airplane-mode-symbolic',
    turnOn: 'start-search-airplane-mode-on', turnOff: 'start-search-airplane-mode-off', keywords: 'start-search-airplane-mode-keywords',
  },
  {
    key: 'keep-awake', control: source => source._caffeine.quickSettingsItems[0], icon: 'view-reveal-symbolic',
    turnOn: 'start-search-keep-awake-on', turnOff: 'start-search-keep-awake-off', keywords: 'start-search-keep-awake-keywords',
  },
];

const SESSION_KEYWORDS = new Map<SessionAction, string>([
  [LOCK, 'start-search-lock-keywords'],
  [POWER_ACTIONS[0], 'start-search-suspend-keywords'],
  [POWER_ACTIONS[1], 'start-search-log-out-keywords'],
  [POWER_ACTIONS[2], 'start-search-restart-keywords'],
  [POWER_ACTIONS[3], 'start-search-power-off-keywords'],
]);

const searchWords = (message: string) => t(message).split(',').map(keyword => keyword.trim()).filter(Boolean);

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
  const words = searchWords(toggle.keywords);
  return [false, true].map(on =>
    entry(key, t(on ? toggle.turnOff : toggle.turnOn), toggle.icon, words, () => flip(control), () => control.visible && control.checked === on));
}

const sessionEntries = () => [...SESSION_KEYWORDS].map(([action, message]) =>
  entry(`action:${action.availability}`, t(action.message), action.icon, searchWords(message), () => action.run(), () => isAvailable(action)));

export class ActionResults {
  private entries: ActionEntry[] = sessionEntries();

  constructor(source: QuickSettingsSource, private readonly close: () => void) {
    source.ready.then(() => {
      const toggles = TOGGLES.flatMap(toggle => {
        const control = toggle.control(source);
        return control ? toggleEntries(toggle, control) : [];
      });
      this.entries = [...toggles, ...this.entries];
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
