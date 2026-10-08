import type AccountsService from 'gi://AccountsService';
import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import St from 'gi://St';
import { Authentication } from 'resource:///com/lantharos/kestrel/auth/authentication.js';
import { AuthPrompt } from 'resource:///com/lantharos/kestrel/auth/authPrompt.js';
import { connectGreetd } from 'resource:///com/lantharos/kestrel/auth/greetd.js';
import { MonitorConstraint } from 'resource:///com/lantharos/kestrel/ui/layout.js';
import { LockBackdrop } from 'resource:///com/lantharos/kestrel/ui/lockScreen/backdrop.js';
import { Clock } from 'resource:///com/lantharos/kestrel/ui/lockScreen/clock.js';
import { LockPages } from 'resource:///com/lantharos/kestrel/ui/lockScreen/pages.js';

import type { Rgb } from '../../appearance/color.js';
import { ContextMenus } from '../../desktop/menus/contextMenus.js';
import type { Monitor } from '../../desktop/panel/panel.js';
import { animateActor } from '../../shared/motion.js';
import { loadKestrelStylesheets } from '../../shared/stylesheet.js';
import { Accounts } from './accounts.js';
import { LoginAppearance } from './appearance.js';
import { readConfig } from './config.js';
import { GreeterControls } from './controls/controls.js';
import { GreeterLayout } from './layout.js';
import { availableSessions, sessionCommand, type Session } from './sessions.js';
import { UserList } from './userList.js';

const IDLE_TIMEOUT = 2 * 60 * 1000;
const ACCOUNTS_TIMEOUT = 1000;
const SWITCH_DURATION = 140;
const FINISH_DURATION = 250;

export interface GreeterContext {
  layoutManager: {
    monitors: Monitor[];
    uiGroup: Clutter.Actor;
    screenShieldGroup: St.Widget;
    addTopChrome(actor: Clutter.Actor): void;
  };
  pushModal(actor: Clutter.Actor): void;
}

function shell(): Shell.Global {
  return global as unknown as Shell.Global;
}

function rememberSession(user: string, session: string): Promise<void> {
  return new Promise(resolve => Gio.DBus.system.call(
    'com.lantharos.Greeter1', '/com/lantharos/Greeter1', 'com.lantharos.Greeter1', 'RememberSession',
    new GLib.Variant('(ss)', [user, session]), null, Gio.DBusCallFlags.NONE, 2000, null,
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
  private readonly dialog = new St.Widget({ name: 'kestrel-greeter', style_class: 'unlock-dialog kestrel-greeter', reactive: true, x_expand: true, y_expand: true });
  private readonly stack = new Shell.Stack();
  private readonly promptBox = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL });
  private readonly main = new St.Widget({ layout_manager: new GreeterLayout(), constraints: new MonitorConstraint({ primary: true }) });
  private readonly appearance = new LoginAppearance();
  private readonly authentication = new Authentication(connectGreetd);
  private readonly prompt = new AuthPrompt(this.authentication);
  private readonly accounts = new Accounts(() => this.showUsers());
  private readonly userList = new UserList(user => this.choose(user));
  private readonly config = readConfig();
  private readonly sessions = availableSessions();
  private readonly menus: ContextMenus;
  private readonly controls: GreeterControls;
  private readonly pages: LockPages;
  private backdrop: LockBackdrop | null = null;
  private showWallpaper!: () => void;
  readonly wallpaperShown = new Promise<void>(resolve => (this.showWallpaper = resolve));
  private selected: AccountsService.User | null = null;
  private session: Session | null = null;
  private started = false;
  private finishing = false;

  constructor(context: GreeterContext) {
    loadKestrelStylesheets();
    this.matchNumLock();
    const monitorAt = (x: number, y: number) =>
      context.layoutManager.monitors.find(monitor => x >= monitor.x && y >= monitor.y && x < monitor.x + monitor.width && y < monitor.y + monitor.height) ?? null;
    this.menus = new ContextMenus(monitorAt, () => {}, () => !this.finishing, () => {}, () => {});
    this.controls = new GreeterControls(this.menus, this.sessions, session => this.useSession(session));

    this.main.add_child(this.stack);
    this.main.add_child(this.userList.actor);
    this.main.add_child(this.controls.actor);
    this.dialog.add_child(this.main);

    this.promptBox.add_child(this.prompt);
    this.stack.add_child(this.promptBox);
    const clock = new Clock();
    this.stack.add_child(clock);

    this.pages = new LockPages({
      actor: this.dialog,
      clock,
      prompt: this.promptBox,
      companions: [this.userList.actor, this.controls.actor],
      actionMode: Shell.ActionMode.LOGIN_SCREEN,
      preparePrompt: () => this.begin(),
      clockShown: () => this.stop(),
      focusPrompt: () => this.prompt.focus(),
    });

    this.prompt.connect('user-name', (_prompt, name) => this.enterUserName(name));
    this.prompt.connect('cancelled', () => this.goBack());
    this.prompt.connect('succeeded', () => void this.finish());
    this.prompt.connect('loading', (_prompt, busy) => (this.userList.sensitive = !busy));

    const idleMonitor = shell().backend.get_core_idle_monitor();
    idleMonitor.add_idle_watch(IDLE_TIMEOUT, () => this.pages.showClock());

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
    const seat = shell().stage.context.get_backend().get_default_seat();
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
      opacity: 0, duration: SWITCH_DURATION, mode: Clutter.AnimationMode.EASE_IN_QUAD,
      onComplete: () => {
        this.prompt.setUser(user);
        if (restart || this.pages.promptShown) this.begin();
        animateActor(this.prompt, { opacity: 255, duration: SWITCH_DURATION, mode: Clutter.AnimationMode.EASE_OUT_QUAD });
      },
    });
  }

  private begin(): void {
    if (this.started) return;
    this.started = true;
    this.prompt.allowGoingBack(false);
    if (this.selected) this.prompt.begin(this.selected.user_name);
    else this.prompt.askForUserName();
  }

  private stop(): void {
    this.started = false;
    this.authentication.cancel();
  }

  private enterUserName(name: string): void {
    const user = this.accounts.find(name);
    const known = user.is_loaded && !user.system_account;
    this.appearance.showWallpaperOf(known ? user.get_uid() : null);
    this.useSession(this.preferredSession(known ? user : null));
    this.prompt.setUser(known ? user : null);
    this.prompt.allowGoingBack(true);
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
    this.pages.showClock();
  }

  private preferredSession(user: AccountsService.User | null): Session | null {
    const preferences = [user?.get_session(), this.config.defaultSession, 'kestrel'];
    return preferences.map(id => this.sessions.find(session => session.id === id)).find(Boolean) ?? this.sessions[0] ?? null;
  }

  private useSession(session: Session | null): void {
    this.session = session;
    this.controls.showSession(session);
  }

  private terminateOnceShown(): void {
    const stage = shell().stage;
    let painted = 0;
    const id = stage.connect('after-paint', () => {
      if (++painted < 2) {
        stage.queue_redraw();
        return;
      }
      stage.disconnect(id);
      shell().context.terminate();
    });
    stage.queue_redraw();
  }

  private async finish(): Promise<void> {
    const user = this.prompt.userName!;
    const session = this.session;
    if (!session) return;
    this.finishing = true;
    this.menus.close(true);
    await rememberSession(user, session.id);
    const { command, environment } = sessionCommand(session);
    if (!await this.authentication.startSession(command, environment)) {
      this.finishing = false;
      this.prompt.cancel();
      return;
    }
    this.controls.shutdown();
    animateActor(this.main, {
      opacity: 0, duration: FINISH_DURATION, mode: Clutter.AnimationMode.EASE_IN_QUAD,
      onComplete: () => this.terminateOnceShown(),
    });
  }
}
