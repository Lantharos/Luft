import Gio from 'gi://Gio';
import type St from 'gi://St';

import { label } from '../../../portal/shortcuts/accelerators.js';
import { Battery, type BatteryState } from '../battery.js';
import { LOCK, bindAvailability } from '../sessionActions.js';
import { openSettings, type SettingsPageId } from '../../../system/settingsPages.js';
import { actionTile, type ActionTile } from './controlTile.js';
import { shortDuration } from '../../../shared/duration.js';

export interface Tile {
  id: string;
  actor: St.Button;
  settingsPanel: SettingsPageId | null;
}

interface ActionHandlers {
  takeScreenshot(): void;
  openSettings(page: SettingsPageId): void;
  close(): void;
}

function showShortcut(tile: ActionTile, schema: string, key: string, settings: Gio.Settings[]): void {
  const source = new Gio.Settings({ schema_id: schema });
  const update = () => {
    const [accelerator] = source.get_strv(key);
    tile.subtitle.text = accelerator ? label(accelerator) : '';
  };
  source.connect(`changed::${key}`, update);
  update();
  settings.push(source);
}

const BATTERY_STATUS = { charging: 'Charging', full: 'Fully charged', plugged: 'Plugged in' };

function batterySubtitle(state: BatteryState): string {
  if (state.status !== 'discharging') return BATTERY_STATUS[state.status];
  if (!state.secondsLeft) return 'On battery';
  return `${shortDuration(state.secondsLeft)} left`;
}

export class ActionTiles {
  readonly tiles: Tile[];
  private readonly settings: Gio.Settings[] = [];
  private readonly battery: Battery;

  constructor(handlers: ActionHandlers, batteryChanged: (state: BatteryState | null) => void) {
    const screenshot = actionTile('camera-photo-symbolic', 'Screenshot', handlers.takeScreenshot);
    showShortcut(screenshot, 'com.lantharos.kestrel.keybindings', 'show-screenshot-ui', this.settings);
    const settings = actionTile('emblem-system-symbolic', 'Settings', () => {
      handlers.close();
      openSettings();
    });
    showShortcut(settings, 'com.lantharos.kestrel.media-keys', 'control-center', this.settings);
    const lock = actionTile(LOCK.icon, 'Lock', () => {
      handlers.close();
      LOCK.run();
    });
    showShortcut(lock, 'com.lantharos.kestrel.media-keys', 'screensaver', this.settings);
    bindAvailability(LOCK, lock.actor);
    const battery = actionTile('battery-missing-symbolic', 'Battery', () => handlers.openSettings('power'));
    battery.actor.visible = false;
    this.battery = new Battery(state => {
      battery.actor.visible = !!state;
      if (state) {
        battery.icon.icon_name = state.iconName;
        battery.title.text = `${state.percentage}%`;
        battery.subtitle.text = batterySubtitle(state);
      }
      batteryChanged(state);
    });
    this.tiles = [
      { id: 'battery', actor: battery.actor, settingsPanel: 'power' },
      { id: 'screenshot', actor: screenshot.actor, settingsPanel: null },
      { id: 'settings', actor: settings.actor, settingsPanel: null },
      { id: 'lock', actor: lock.actor, settingsPanel: 'privacy' },
    ];
  }

  destroy(): void {
    this.battery.destroy();
    for (const settings of this.settings) settings.run_dispose();
  }
}
