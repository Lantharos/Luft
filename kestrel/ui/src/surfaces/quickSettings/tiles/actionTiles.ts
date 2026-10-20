import Gio from 'gi://Gio';
import type St from 'gi://St';

import { label } from '../../../portal/shortcuts/accelerators.js';
import { FluentNumber, localized, t } from '../../../shared/i18n/index.js';
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
  localized(tile.subtitle, update);
  settings.push(source);
}

function batterySubtitle({ status, secondsLeft }: BatteryState): string {
  if (status === 'charging')
    return secondsLeft ? t('quick-settings-battery-until-full', { duration: shortDuration(secondsLeft) }) : t('quick-settings-battery-charging');
  if (status === 'discharging')
    return secondsLeft ? t('quick-settings-battery-left', { duration: shortDuration(secondsLeft) }) : t('quick-settings-battery-discharging');
  return t(status === 'full' ? 'quick-settings-battery-full' : 'quick-settings-battery-plugged-in');
}

export class ActionTiles {
  readonly tiles: Tile[];
  private readonly settings: Gio.Settings[] = [];
  private readonly unwatchBattery: () => void;

  constructor(handlers: ActionHandlers) {
    const screenshot = actionTile('camera-photo-symbolic', 'quick-settings-screenshot', handlers.takeScreenshot);
    showShortcut(screenshot, 'com.lantharos.kestrel.keybindings', 'show-screenshot-ui', this.settings);
    const settings = actionTile('emblem-system-symbolic', 'quick-settings-settings', () => {
      handlers.close();
      openSettings();
    });
    showShortcut(settings, 'com.lantharos.kestrel.media-keys', 'control-center', this.settings);
    const lock = actionTile(LOCK.icon, LOCK.message, () => {
      handlers.close();
      LOCK.run();
    });
    showShortcut(lock, 'com.lantharos.kestrel.media-keys', 'screensaver', this.settings);
    bindAvailability(LOCK, lock.actor);
    const batteryTile = actionTile(new BatteryIndicator(TILE_ICON_SIZE, 'never').actor, 'quick-settings-battery', () => handlers.openSettings('power'));
    let batteryState: BatteryState | null = null;
    const showBattery = () => {
      if (!batteryState) return;
      batteryTile.title.text = t('quick-settings-battery-level', { percent: new FluentNumber(batteryState.percentage / 100, { style: 'percent' }) });
      batteryTile.subtitle.text = batterySubtitle(batteryState);
    };
    localized(batteryTile.title, showBattery);
    this.unwatchBattery = battery.watch(state => {
      batteryState = state;
      batteryTile.actor.visible = !!state;
      showBattery();
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
