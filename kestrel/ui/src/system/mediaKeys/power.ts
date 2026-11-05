import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import * as SystemActions from '../../session/actions/systemActions.js';
import { WakePress } from '../../session/actions/wakePress.js';
import { mutterObject, mutterProperty } from '../../portal/sharing/mutter.js';

const LOGIN = 'org.freedesktop.login1';
const LOGIN_PATH = '/org/freedesktop/login1';
const LOGIN_MANAGER = 'org.freedesktop.login1.Manager';
const DISPLAY_CONFIG_NAME = 'org.gnome.Mutter.DisplayConfig';
const DISPLAY_CONFIG = mutterObject(DISPLAY_CONFIG_NAME, '/org/gnome/Mutter/DisplayConfig', DISPLAY_CONFIG_NAME);
const SCREEN_ON = 0;
const SKIP_INHIBITORS = 1 << 4;
const AVAILABLE = new Set(['yes', 'challenge', 'inhibited', 'inhibitor-blocked', 'challenge-inhibitor-blocked']);

type SleepAction = 'Suspend' | 'Hibernate' | 'PowerOff';

function login(method: string, parameters: GLib.Variant | null, replyType: string | null, interactive = false): Promise<GLib.Variant> {
  const flags = interactive ? Gio.DBusCallFlags.ALLOW_INTERACTIVE_AUTHORIZATION : Gio.DBusCallFlags.NONE;
  return Gio.DBus.system.call(LOGIN, LOGIN_PATH, LOGIN_MANAGER, method, parameters,
    replyType ? new GLib.VariantType(replyType) : null, flags, -1, null);
}

function systemAction(run: (actions: ReturnType<typeof SystemActions.getDefault>) => void): void {
  try {
    run(SystemActions.getDefault());
  } catch (error) {
    console.warn(`The key's action isn't available: ${error}`);
  }
}

export class PowerKeys {
  private readonly settings = new Gio.Settings({ schema_id: 'com.lantharos.kestrel.power' });
  private readonly wakePress = new WakePress();
  private virtualMachine = false;
  private screenOff = false;

  constructor(private readonly locked: () => boolean, private readonly openLockedPowerMenu: () => void) {
    global.backend.get_monitor_manager().connectObject('power-save-mode-changed', () => this.readScreen().catch(logError), this);
    void this.readChassis();
  }

  private async readScreen(): Promise<void> {
    this.screenOff = await mutterProperty<number>(DISPLAY_CONFIG, 'PowerSaveMode') !== SCREEN_ON;
  }

  private async readChassis(): Promise<void> {
    const reply = await Gio.DBus.system.call('org.freedesktop.hostname1', '/org/freedesktop/hostname1', 'org.freedesktop.DBus.Properties', 'Get',
      new GLib.Variant('(ss)', ['org.freedesktop.hostname1', 'Chassis']), new GLib.VariantType('(v)'), Gio.DBusCallFlags.NONE, -1, null)
      .catch(() => null);
    this.virtualMachine = reply?.get_child_value(0).get_variant().deep_unpack() === 'vm';
  }

  powerButton(): void {
    if (this.wakePress.heard || this.screenOff) return;
    const action = this.settings.get_string('power-button-action');
    if (action === 'nothing') return;
    if (this.virtualMachine) {
      void this.sleep('PowerOff', false);
      return;
    }
    if (action === 'interactive') this.ask();
    else void this.sleepOrAsk(action === 'hibernate' ? 'Hibernate' : 'Suspend');
  }

  sleepKey(action: 'Suspend' | 'Hibernate'): void {
    void this.sleepOrAsk(action);
  }

  private async sleepOrAsk(action: SleepAction): Promise<void> {
    const [answer] = (await login(`Can${action}`, null, '(s)').catch(() => new GLib.Variant('(s)', ['na']))).deep_unpack() as [string];
    if (!AVAILABLE.has(answer) || !await this.sleep(action, !this.locked())) this.ask();
  }

  private async sleep(action: SleepAction, interactive: boolean): Promise<boolean> {
    const flags = action === 'PowerOff' ? 0 : SKIP_INHIBITORS;
    try {
      await login(`${action}WithFlags`, new GLib.Variant('(t)', [flags]), null, interactive);
      return true;
    } catch (error) {
      console.warn(`The computer couldn't ${action.toLowerCase()}: ${error}`);
      return false;
    }
  }

  private ask(): void {
    if (this.locked()) this.openLockedPowerMenu();
    else SystemActions.getDefault().showPowerOptions();
  }

  lock(): void {
    systemAction(actions => actions.activateLockScreen());
  }

  logOut(): void {
    systemAction(actions => actions.activateLogout());
  }

  restart(): void {
    systemAction(actions => actions.activateRestart());
  }

  powerOff(): void {
    systemAction(actions => actions.activatePowerOff());
  }

  destroy(): void {
    this.wakePress.destroy();
    global.backend.get_monitor_manager().disconnectObject(this);
  }
}
