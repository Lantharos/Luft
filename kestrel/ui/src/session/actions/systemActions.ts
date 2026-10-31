import Gio from 'gi://Gio';
import GObject from 'gi://GObject';

import { logErrorUnlessCancelled } from '../../core/runtime/errorUtils.js';
import * as GnomeSession from './gnomeSession.js';
import * as Main from '../../core/main.js';

const LOCKDOWN_SCHEMA = 'org.gnome.desktop.lockdown';
const SCREENSAVER_SCHEMA = 'org.gnome.desktop.screensaver';
const DISABLE_LOG_OUT_KEY = 'disable-log-out';
const RESTART_ENABLED_KEY = 'restart-enabled';

type ActionId = 'power-off' | 'restart' | 'lock-screen' | 'logout' | 'suspend';

interface SessionManagerProxy {
  CanShutdownAsync(): Promise<[number]>;
  CanRebootAsync(): Promise<[number]>;
  CanSuspendAsync(): Promise<[number]>;
  LogoutAsync(mode: number): Promise<[]>;
  ShutdownAsync(mode: number): Promise<[]>;
  RebootAsync(): Promise<[]>;
  SuspendAsync(): Promise<[]>;
}

interface Availability {
  canHave: boolean;
  needsAuth: boolean;
}

let singleton: SystemActions | null = null;

export function getDefault(): SystemActions {
  singleton ??= new SystemActions();
  return singleton;
}

const readable = (name: string) => GObject.ParamSpec.boolean(name, null, null, GObject.ParamFlags.READABLE, false);

const SystemActions = GObject.registerClass({
  Properties: {
    'can-power-off': readable('can-power-off'),
    'can-restart': readable('can-restart'),
    'can-suspend': readable('can-suspend'),
    'can-lock-screen': readable('can-lock-screen'),
    'can-logout': readable('can-logout'),
  },
}, class SystemActions extends GObject.Object {
  private powerOff: Availability = { canHave: true, needsAuth: false };
  private reboot: Availability = { canHave: true, needsAuth: false };
  private suspend: Availability = { canHave: true, needsAuth: false };
  private readonly actions = new Map<ActionId, boolean>([
    ['power-off', false],
    ['restart', false],
    ['lock-screen', false],
    ['logout', false],
    ['suspend', false],
  ]);

  private readonly lockdownSettings = new Gio.Settings({ schema_id: LOCKDOWN_SCHEMA });
  private readonly screenSaverSettings = new Gio.Settings({ schema_id: SCREENSAVER_SCHEMA });
  private readonly session = (GnomeSession.SessionManager as unknown as () => SessionManagerProxy)();

  constructor() {
    super();

    const updateLogout = () => this.updateLogout();
    this.lockdownSettings.connect(`changed::${DISABLE_LOG_OUT_KEY}`, updateLogout);

    this.lockdownSettings.connect(`changed::${DISABLE_LOG_OUT_KEY}`, () => {
      void this.updateHaveShutdown();
      void this.updateHaveReboot();
    });

    this.screenSaverSettings.connect(`changed::${RESTART_ENABLED_KEY}`, () => {
      void this.updateHaveShutdown();
      void this.updateHaveReboot();
    });

    void this.updateHaveShutdown();
    void this.updateHaveReboot();
    void this.updateHaveSuspend();

    Main.sessionMode.connect('updated', () => this.sessionUpdated());
    this.sessionUpdated();
  }

  get canPowerOff(): boolean {
    return this.actions.get('power-off')!;
  }

  get canRestart(): boolean {
    return this.actions.get('restart')!;
  }

  get canSuspend(): boolean {
    return this.actions.get('suspend')!;
  }

  get canLockScreen(): boolean {
    return this.actions.get('lock-screen')!;
  }

  get canLogout(): boolean {
    return this.actions.get('logout')!;
  }

  private sessionUpdated(): void {
    this.updateLockScreen();
    this.updatePowerOff();
    this.updateReboot();
    this.updateSuspend();
    this.updateLogout();
  }

  private setAvailable(id: ActionId, available: boolean): void {
    this.actions.set(id, available);
    this.notify(`can-${id}`);
  }

  private async availability(query: () => Promise<[number]>): Promise<Availability> {
    try {
      const [availability] = await query();
      return {
        canHave: availability !== GnomeSession.ActionAvailability.UNAVAILABLE,
        needsAuth: availability === GnomeSession.ActionAvailability.CHALLENGE,
      };
    } catch {
      return { canHave: false, needsAuth: false };
    }
  }

  private restartDisabledWhileLocked(needsAuth: boolean): boolean {
    return Main.sessionMode.isLocked && (!this.screenSaverSettings.get_boolean(RESTART_ENABLED_KEY) || needsAuth);
  }

  private updateLockScreen(): void {
    this.setAvailable('lock-screen', !Main.sessionMode.isLocked);
  }

  private async updateHaveShutdown(): Promise<void> {
    this.powerOff = await this.availability(() => this.session.CanShutdownAsync());
    this.updatePowerOff();
  }

  private updatePowerOff(): void {
    this.setAvailable('power-off', this.powerOff.canHave && !this.restartDisabledWhileLocked(this.powerOff.needsAuth));
  }

  private async updateHaveReboot(): Promise<void> {
    this.reboot = await this.availability(() => this.session.CanRebootAsync());
    this.updateReboot();
  }

  private updateReboot(): void {
    this.setAvailable('restart', this.reboot.canHave && !this.restartDisabledWhileLocked(this.reboot.needsAuth));
  }

  private async updateHaveSuspend(): Promise<void> {
    this.suspend = await this.availability(() => this.session.CanSuspendAsync());
    this.updateSuspend();
  }

  private updateSuspend(): void {
    const disabled = Main.sessionMode.isLocked && this.suspend.needsAuth;
    this.setAvailable('suspend', this.suspend.canHave && !disabled);
  }

  private updateLogout(): void {
    const allowLogout = !this.lockdownSettings.get_boolean(DISABLE_LOG_OUT_KEY);
    this.setAvailable('logout', allowLogout && !Main.sessionMode.isLocked);
  }

  private require(id: ActionId): void {
    if (!this.actions.get(id)) throw new Error(`The ${id} action is not available!`);
  }

  activateLockScreen(): void {
    this.require('lock-screen');
    Main.screenShield.lock(true);
  }

  activateLogout(): void {
    this.require('logout');
    this.session.LogoutAsync(0).catch(logErrorUnlessCancelled);
  }

  activatePowerOff(): void {
    this.require('power-off');
    this.session.ShutdownAsync(0).catch(logErrorUnlessCancelled);
  }

  activateRestart(): void {
    this.require('restart');
    this.session.RebootAsync().catch(logErrorUnlessCancelled);
  }

  activateSuspend(): void {
    this.require('suspend');
    this.session.SuspendAsync().catch(logErrorUnlessCancelled);
  }
});

type SystemActions = InstanceType<typeof SystemActions>;
