import Gio from 'gi://Gio';
import type St from 'gi://St';

import { label } from '../../../portal/shortcuts/accelerators.js';
import { battery, type BatteryState } from '../../../shared/battery/battery.js';
import { BatteryIndicator } from '../../../shared/battery/indicator.js';
import { LOCK, bindAvailability } from '../sessionActions.js';
import { openSettings, type SettingsPageId } from '../../../system/settingsPages.js';
import { actionTile, TILE_ICON_SIZE, type ActionTile } from './controlTile.js';
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

const onKeyboard = (accelerator: string) => !accelerator.replace(/<[^>]+>/g, '').startsWith('XF86');

function showShortcut(tile: ActionTile, schema: string, key: string, settings: Gio.Settings[]): void {
  const source = new Gio.Settings({ schema_id: schema });
  const update = () => {
    const accelerator = source.get_strv(key).find(onKeyboard);
    tile.subtitle.text = accelerator ? label(accelerator) : '';
  };
  source.connect(`changed::${key}`, update);
  update();
  settings.push(source);
}

function batterySubtitle({ status, secondsLeft }: BatteryState): string {
  if (status === 'charging') return secondsLeft ? `${shortDuration(secondsLeft)} until full` : 'Charging';
  if (status === 'discharging') return secondsLeft ? `${shortDuration(secondsLeft)} left` : 'On battery';
  return status === 'full' ? 'Fully charged' : 'Plugged in';
}

export class ActionTiles {
  readonly tiles: Tile[];
  private readonly settings: Gio.Settings[] = [];
  private readonly unwatchBattery: () => void;

  constructor(handlers: ActionHandlers) {
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
    const batteryTile = actionTile(new BatteryIndicator(TILE_ICON_SIZE, 'never').actor, 'Battery', () => handlers.openSettings('power'));
    this.unwatchBattery = battery.watch(state => {
      batteryTile.actor.visible = !!state;
      if (!state) return;
      batteryTile.title.text = `${state.percentage}%`;
      batteryTile.subtitle.text = batterySubtitle(state);
    });
    this.tiles = [
      { id: 'battery', actor: batteryTile.actor, settingsPanel: 'power' },
      { id: 'screenshot', actor: screenshot.actor, settingsPanel: null },
      { id: 'settings', actor: settings.actor, settingsPanel: null },
      { id: 'lock', actor: lock.actor, settingsPanel: 'privacy' },
    ];
  }

  destroy(): void {
    this.unwatchBattery();
    for (const settings of this.settings) settings.run_dispose();
  }
}
