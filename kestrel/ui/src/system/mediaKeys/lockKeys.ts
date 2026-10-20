import type Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import type Shell from 'gi://Shell';

import type { Context } from '../../context.js';
import { t } from '../../shared/i18n/index.js';

type ShowOsd = Context['showOsd'];
type LayoutManager = Context['layoutManager'];

interface LockKey {
  on: string;
  off: string;
  icon: string;
  isOn(keymap: Clutter.Keymap): boolean;
}

const LOCK_KEYS: LockKey[] = [
  { on: 'media-keys-caps-lock-on', off: 'media-keys-caps-lock-off', icon: 'caps-lock', isOn: keymap => keymap.get_caps_lock_state() },
  { on: 'media-keys-num-lock-on', off: 'media-keys-num-lock-off', icon: 'num-lock', isOn: keymap => keymap.get_num_lock_state() },
];

export class LockKeys {
  private readonly keymap = (global as unknown as Shell.Global).stage.context.get_backend().get_default_seat().get_keymap();
  private readonly settings = new Gio.Settings({ schema_id: 'com.lantharos.kestrel.media-keys' });
  private states = this.read();
  private startup = 0;
  private stateChanged = 0;

  constructor(private readonly showOsd: ShowOsd, private readonly layoutManager: LayoutManager) {
    this.startup = layoutManager.connect('startup-complete', () => this.watch());
  }

  private watch(): void {
    this.layoutManager.disconnect(this.startup);
    this.startup = 0;
    this.states = this.read();
    this.stateChanged = this.keymap.connect('state-changed', () => this.sync());
  }

  private read(): boolean[] {
    return LOCK_KEYS.map(key => key.isOn(this.keymap));
  }

  private sync(): void {
    const previous = this.states;
    this.states = this.read();
    if (!this.settings.get_boolean('lock-key-notices')) return;
    LOCK_KEYS.forEach((key, index) => {
      const on = this.states[index];
      if (on === previous[index]) return;
      this.showOsd(Gio.ThemedIcon.new(`${key.icon}-${on ? 'on' : 'off'}-symbolic`), t(on ? key.on : key.off), null, 1);
    });
  }

  destroy(): void {
    if (this.startup) this.layoutManager.disconnect(this.startup);
    if (this.stateChanged) this.keymap.disconnect(this.stateChanged);
  }
}
