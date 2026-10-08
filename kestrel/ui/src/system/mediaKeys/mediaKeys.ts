import Gio from 'gi://Gio';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import type { Context } from '../../context.js';
import { openSettings } from '../settingsPages.js';
import { AccessibilityKeys } from './accessibility.js';
import { DeviceKeys } from './devices.js';
import { CustomShortcuts, launch } from './launchers.js';
import { Players, type PlayerKey } from './players.js';
import { PowerKeys } from './power.js';
import { VolumeKeys, type VolumeChange } from './volume.js';

const SCHEMA = 'com.lantharos.kestrel.media-keys';
const ANYWHERE = Shell.ActionMode.ALL;
const DESKTOP = Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW;
const UNLESS_UNLOCKING = Shell.ActionMode.ALL & ~Shell.ActionMode.UNLOCK_SCREEN;
const POWER = DESKTOP | Shell.ActionMode.LOGIN_SCREEN | Shell.ActionMode.LOCK_SCREEN | Shell.ActionMode.UNLOCK_SCREEN;

interface Binding {
  modes: Shell.ActionMode;
  repeats?: boolean;
  run(): void;
}

export class MediaKeys {
  private readonly volume: VolumeKeys;
  private readonly players = new Players();
  private readonly power: PowerKeys;
  private readonly devices: DeviceKeys;
  private readonly accessibility = new AccessibilityKeys();
  private readonly custom: CustomShortcuts;

  constructor(private readonly context: Context, openStart: () => void) {
    this.volume = new VolumeKeys(context.showOsd);
    this.power = new PowerKeys(() => context.sessionMode.isLocked);
    this.devices = new DeviceKeys(context.showOsd);
    this.custom = new CustomShortcuts(context.keybindings);
    const sound = (change: VolumeChange, output: boolean, options: { quiet?: boolean; precise?: boolean } = {}) =>
      () => this.volume.change(change, { output, ...options });
    const player = (key: PlayerKey) => () => this.press(key);
    const bindings: Record<string, Binding> = {
      'volume-mute': { modes: ANYWHERE, run: sound('mute', true) },
      'volume-down': { modes: ANYWHERE, repeats: true, run: sound('down', true) },
      'volume-up': { modes: ANYWHERE, repeats: true, run: sound('up', true) },
      'volume-mute-quiet': { modes: ANYWHERE, run: sound('mute', true, { quiet: true }) },
      'volume-down-quiet': { modes: ANYWHERE, repeats: true, run: sound('down', true, { quiet: true }) },
      'volume-up-quiet': { modes: ANYWHERE, repeats: true, run: sound('up', true, { quiet: true }) },
      'volume-down-precise': { modes: ANYWHERE, repeats: true, run: sound('down', true, { precise: true }) },
      'volume-up-precise': { modes: ANYWHERE, repeats: true, run: sound('up', true, { precise: true }) },
      'mic-mute': { modes: ANYWHERE, run: sound('mute', false) },
      'play': { modes: ANYWHERE, run: player('play') },
      'pause': { modes: ANYWHERE, run: player('pause') },
      'stop': { modes: ANYWHERE, run: player('stop') },
      'previous': { modes: ANYWHERE, repeats: true, run: player('previous') },
      'next': { modes: ANYWHERE, repeats: true, run: player('next') },
      'playback-rewind': { modes: ANYWHERE, repeats: true, run: player('rewind') },
      'playback-forward': { modes: ANYWHERE, repeats: true, run: player('forward') },
      'playback-repeat': { modes: ANYWHERE, repeats: true, run: player('repeat') },
      'playback-random': { modes: ANYWHERE, repeats: true, run: player('shuffle') },
      'keyboard-brightness-up': { modes: ANYWHERE, repeats: true, run: () => void this.devices.keyboardBrightness('StepUp') },
      'keyboard-brightness-down': { modes: ANYWHERE, repeats: true, run: () => void this.devices.keyboardBrightness('StepDown') },
      'keyboard-brightness-toggle': { modes: ANYWHERE, run: () => void this.devices.keyboardBrightness('Toggle') },
      'touchpad-toggle': { modes: ANYWHERE, run: () => this.devices.touchpadEnabled(null) },
      'touchpad-on': { modes: ANYWHERE, run: () => this.devices.touchpadEnabled(true) },
      'touchpad-off': { modes: ANYWHERE, run: () => this.devices.touchpadEnabled(false) },
      'rotate-video-lock': { modes: ANYWHERE, repeats: true, run: () => void this.devices.toggleRotationLock() },
      'battery-status': { modes: DESKTOP, run: () => void this.devices.showBattery() },
      'rfkill': { modes: DESKTOP, run: () => void this.devices.toggleRadios(false) },
      'rfkill-bluetooth': { modes: DESKTOP, run: () => void this.devices.toggleRadios(true) },
      'eject': { modes: ANYWHERE, run: () => this.devices.eject() },
      'www': { modes: DESKTOP, run: () => launch('www') },
      'email': { modes: DESKTOP, run: () => launch('email') },
      'calculator': { modes: DESKTOP, run: () => launch('calculator') },
      'media': { modes: DESKTOP, run: () => launch('media') },
      'home': { modes: DESKTOP, run: () => launch('home') },
      'search': { modes: DESKTOP, run: openStart },
      'control-center': { modes: DESKTOP, run: () => openSettings() },
      'screensaver': { modes: UNLESS_UNLOCKING, run: () => this.power.lock() },
      'logout': { modes: DESKTOP, run: () => this.power.logOut() },
      'reboot': { modes: DESKTOP, run: () => this.power.restart() },
      'shutdown': { modes: DESKTOP, run: () => this.power.powerOff() },
      'power': { modes: POWER, run: () => this.power.powerButton() },
      'suspend': { modes: POWER, run: () => this.power.sleepKey('Suspend') },
      'hibernate': { modes: POWER, run: () => this.power.sleepKey('Hibernate') },
      'magnifier': { modes: ANYWHERE, run: () => this.accessibility.toggle('screen-magnifier-enabled') },
      'screenreader': { modes: ANYWHERE, run: () => this.accessibility.toggle('screen-reader-enabled') },
      'on-screen-keyboard': { modes: ANYWHERE, run: () => this.accessibility.toggle('screen-keyboard-enabled') },
      'increase-text-size': { modes: ANYWHERE, repeats: true, run: () => this.accessibility.textSize(true) },
      'decrease-text-size': { modes: ANYWHERE, repeats: true, run: () => this.accessibility.textSize(false) },
      'toggle-contrast': { modes: ANYWHERE, run: () => this.accessibility.toggleContrast() },
      'magnifier-zoom-in': { modes: ANYWHERE, repeats: true, run: () => this.accessibility.zoom(true) },
      'magnifier-zoom-out': { modes: ANYWHERE, repeats: true, run: () => this.accessibility.zoom(false) },
    };
    const settings = new Gio.Settings({ schema_id: SCHEMA });
    for (const [name, { modes, repeats, run }] of Object.entries(bindings))
      context.keybindings.add(name, settings, repeats ? Meta.KeyBindingFlags.NONE : Meta.KeyBindingFlags.IGNORE_AUTOREPEAT, modes, run);
  }

  private press(key: PlayerKey): void {
    if (!this.players.press(key)) this.context.showOsd(Gio.ThemedIcon.new('action-unavailable-symbolic'), null, null, 1);
  }

  destroy(): void {
    this.volume.destroy();
    this.players.destroy();
    this.power.destroy();
    this.custom.destroy();
  }
}
