import type AccountsService from 'gi://AccountsService';
import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import St from 'gi://St';
import type { SignInMethod } from '../lockScreen/signInMethod.js';
import { Authentication } from '../prompt/authentication.js';
import { AuthPrompt } from '../prompt/authPrompt.js';
import { connectGreetd } from '../prompt/greetd.js';
import { LockBackdrop } from '../lockScreen/backdrop.js';
import { Monument } from '../monument/monument.js';

import type { Rgb } from '../../appearance/color.js';
import { ContextMenus } from '../../desktop/menus/contextMenus.js';
import type { Monitor } from '../../desktop/panel/panel.js';
import { terminateOnceShown } from '../../shared/apps/handoff.js';
import { animateActor, Curve, Duration } from '../../shared/motion/motion.js';
import type { StartupSignals } from '../../system/health/startup.js';
import { Accounts } from './accounts.js';
import { LoginAppearance } from './appearance.js';
import { readConfig } from './config.js';
import { GreeterControls } from './controls/controls.js';
import { availableSessions, sessionCommand, type Session } from './sessions.js';
import { GreeterSignIn } from './signIn.js';
import { UserList } from './userList.js';

const IDLE_TIMEOUT = 2 * 60 * 1000;
const ACCOUNTS_TIMEOUT = 1000;

export interface GreeterContext {
  layoutManager: StartupSignals & {
    monitors: Monitor[];
    uiGroup: Clutter.Actor;
    screenShieldGroup: St.Widget;
    addTopChrome(actor: Clutter.Actor): void;
  };
  pushModal(actor: Clutter.Actor): void;
}

function rememberSession(user: string, session: string, method: SignInMethod): Promise<void> {
  return new Promise(resolve => Gio.DBus.system.call(
    'com.lantharos.Greeter1', '/com/lantharos/Greeter1', 'com.lantharos.Greeter1', 'RememberSession',
    new GLib.Variant('(sss)', [user, session, method]), null, Gio.DBusCallFlags.NONE, 2000, null,
    (connection, result) => {
      try {
        connection!.call_finish(result);
      } catch (error) {
        console.warn(`The session choice was not remembered: ${error}`);
      }
      resolve();
    }));
}

export class Greeter {
  private readonly dialog = new St.Widget({ name: 'kestrel-greeter', style_class: 'kestrel-lock kestrel-greeter', reactive: true, x_expand: true, y_expand: true });
  private readonly promptBox = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL });
  private readonly appearance = new LoginAppearance();
  private readonly authentication = new Authentication(connectGreetd);
  private readonly signIn = new GreeterSignIn(this.authentication);
  private readonly prompt = new AuthPrompt(this.signIn);
  private readonly accounts = new Accounts(() => this.showUsers());
  private readonly userList = new UserList(user => this.choose(user));
  private readonly config = readConfig();
  private readonly sessions = availableSessions();
  private readonly menus: ContextMenus;
  private readonly controls: GreeterControls;
  private readonly monument: Monument;
  private backdrop: LockBackdrop | null = null;
  private showWallpaper!: () => void;
  readonly wallpaperShown = new Promise<void>(resolve => (this.showWallpaper = resolve));
  private selected: AccountsService.User | null = null;
  private session: Session | null = null;
  private started = false;
  private finishing = false;

  constructor(context: GreeterContext) {
    this.matchNumLock();
    this.signIn.attach(this.prompt);
    const monitorAt = (x: number, y: number) =>
      context.layoutManager.monitors.find(monitor => x >= monitor.x && y >= monitor.y && x < monitor.x + monitor.width && y < monitor.y + monitor.height) ?? null;
    this.menus = new ContextMenus(monitorAt, () => {}, () => !this.finishing, () => {}, () => {});
    this.controls = new GreeterControls(this.menus, this.sessions, session => this.useSession(session));

    this.promptBox.add_child(this.prompt);
    this.monument = new Monument({
      root: this.dialog,
      auth: this.promptBox,
      side: this.userList.actor,
      controls: this.controls.actor,
      actionMode: Shell.ActionMode.LOGIN_SCREEN,
      preparePrompt: () => this.begin(),
      asleep: () => this.stop(),
      focusPrompt: typed => this.prompt.focus(typed),
    });
    this.dialog.add_child(this.monument.actor);

    this.prompt.connect('user-name', (_prompt, name) => this.enterUserName(name));
    this.prompt.connect('cancelled', () => this.goBack());
    this.prompt.connect('succeeded', () => void this.finish());
    this.prompt.connect('loading', (_prompt, busy) => (this.userList.sensitive = !busy));

    const idleMonitor = global.backend.get_core_idle_monitor();
    idleMonitor.add_idle_watch(IDLE_TIMEOUT, () => this.monument.wake.sleep());

    const shield = context.layoutManager.screenShieldGroup;
    shield.add_child(this.dialog);
    shield.show();
    context.layoutManager.addTopChrome(this.menus.shield);
    context.layoutManager.addTopChrome(this.menus.actor);
    context.pushModal(context.layoutManager.uiGroup);
    this.dialog.grab_key_focus();

    if (this.accounts.loaded) this.showUsers();
    else GLib.timeout_add(GLib.PRIORITY_DEFAULT, ACCOUNTS_TIMEOUT, () => {
      if (!this.backdrop) this.choose(null);
      return GLib.SOURCE_REMOVE;
    });
  }

  private matchNumLock(): void {
    const seat = global.stage.context.get_backend().get_default_seat();
    if (seat.get_keymap().get_num_lock_state() === this.config.numLock) return;
    const keyboard = seat.create_virtual_device(Clutter.InputDeviceType.KEYBOARD_DEVICE);
    const time = GLib.get_monotonic_time();
    keyboard.notify_keyval(time, Clutter.KEY_Num_Lock, Clutter.KeyState.PRESSED);
    keyboard.notify_keyval(time, Clutter.KEY_Num_Lock, Clutter.KeyState.RELEASED);
  }

  wallpaperSampled(samples: Rgb[]): void {
    this.appearance.wallpaperSampled(samples);
  }

  private showUsers(): void {
    if (!this.accounts.loaded) return;
    const users = this.accounts.listed(this.config);
    const offerOthers = this.accounts.hasUnlisted(this.config);
    const selected = users.includes(this.selected!) ? this.selected : this.accounts.lastSignedIn(users);
    this.userList.show(users, offerOthers, selected);
    this.choose(selected);
  }

  private choose(user: AccountsService.User | null): void {
    if (this.finishing || (user === this.selected && this.started)) return;
    this.selected = user;
    this.userList.select(user);
    this.appearance.showWallpaperOf(user?.get_uid() ?? null);
    if (!this.backdrop) {
      this.backdrop = new LockBackdrop();
      this.dialog.insert_child_at_index(this.backdrop.actor, 0);
      void this.backdrop.loaded.then(this.showWallpaper);
    }
    this.useSession(this.preferredSession(user));
    const restart = this.started;
    this.stop();
    animateActor(this.prompt, {
      opacity: 0, duration: Duration.tap, curve: Curve.decelerate,
      onComplete: () => {
        this.prompt.setUser(user);
        if (restart || this.monument.wake.promptShown) this.begin();
        animateActor(this.prompt, { opacity: 255, duration: Duration.quick, curve: Curve.decelerate });
      },
    });
  }

  private begin(): void {
    if (this.started) return;
    this.started = true;
    this.prompt.allowGoingBack(false);
    if (!this.selected) {
      this.prompt.askForUserName();
      return;
    }
    this.signIn.prepare(this.selected.get_uid());
    this.prompt.begin(this.selected.user_name);
  }

  private stop(): void {
    this.started = false;
    this.signIn.cancel();
  }

  private enterUserName(name: string): void {
    const user = this.accounts.find(name);
    const known = user.is_loaded && !user.system_account;
    this.appearance.showWallpaperOf(known ? user.get_uid() : null);
    this.useSession(this.preferredSession(known ? user : null));
    this.prompt.setUser(known ? user : null);
    this.prompt.allowGoingBack(true);
    this.signIn.prepare(known ? user.get_uid() : null);
    this.prompt.begin(name);
  }

  private goBack(): void {
    if (!this.selected && this.prompt.userName) {
      this.appearance.showWallpaperOf(null);
      this.prompt.setUser(null);
      this.prompt.allowGoingBack(false);
      this.prompt.askForUserName();
      return;
    }
    this.monument.wake.sleep();
  }

  private preferredSession(user: AccountsService.User | null): Session | null {
    const preferences = [user?.get_session(), this.config.defaultSession, 'kestrel'];
    return preferences.map(id => this.sessions.find(session => session.id === id)).find(Boolean) ?? this.sessions[0] ?? null;
  }

  private useSession(session: Session | null): void {
    this.session = session;
    this.controls.showSession(session);
  }

  private async finish(): Promise<void> {
    const user = this.prompt.userName!;
    const session = this.session;
    if (!session) return;
    this.finishing = true;
    this.menus.close(true);
    await rememberSession(user, session.id, this.signIn.method);
    const { command, environment } = sessionCommand(session, this.accounts.find(user).get_language() ?? '');
    if (!await this.authentication.startSession(command, environment)) {
      this.finishing = false;
      this.prompt.cancel();
      return;
    }
    this.controls.shutdown();
    animateActor(this.monument.actor, {
      opacity: 0, duration: Duration.standard, curve: Curve.decelerate,
      onComplete: terminateOnceShown,
    });
  }
}
