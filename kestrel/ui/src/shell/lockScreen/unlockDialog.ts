import AccountsService from 'gi://AccountsService';
import Atk from 'gi://Atk';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as KestrelUi from '../../kestrelUi.js';
import * as Layout from '../stage/layout.js';
import * as Main from '../main.js';
import { Authentication, type AuthenticationSignals } from '../auth/authentication.js';
import { AuthPrompt } from '../auth/authPrompt.js';
import { FingerprintAuthentication } from '../auth/fingerprint.js';
import { connectAuthenticator } from '../auth/greetd.js';
import * as Signals from '../runtime/signals.js';
import { LockBackdrop } from './backdrop.js';
import { Clock } from './clock.js';
import { NotificationsBox } from './notifications.js';
import { LockPages } from './pages.js';

const IDLE_TIMEOUT = 2 * 60;
const PASSWORD_QUESTION = 'Password: ';
const FIXED_PROMPT_HEIGHT = 550;

class RehearsedAuthentication extends Signals.EventEmitter {
  declare emit: GObject.SignalMethods<this, AuthenticationSignals>['emit'];

  begin(): void {
    this.emit('question', PASSWORD_QUESTION, true);
  }

  answer(): void {}

  cancel(): void {}
}

class UnlockDialogLayout extends Clutter.LayoutManager {
  static {
    GObject.registerClass(this);
  }

  constructor(
    private readonly stack: Clutter.Actor,
    private readonly notifications: Clutter.Actor,
    private readonly controls: Clutter.Actor,
  ) {
    super();
  }

  vfunc_get_preferred_width(_container: Clutter.Actor, forHeight: number): [number, number] {
    return this.stack.get_preferred_width(forHeight);
  }

  vfunc_get_preferred_height(_container: Clutter.Actor, forWidth: number): [number, number] {
    return this.stack.get_preferred_height(forWidth);
  }

  vfunc_allocate(_container: Clutter.Actor, box: Clutter.ActorBox): void {
    const [width, height] = box.get_size();
    const [, , stackWidth, stackHeight] = this.stack.get_preferred_size();
    const [, , notificationsWidth, notificationsHeight] = this.notifications.get_preferred_size();
    const columnWidth = Math.max(stackWidth, notificationsWidth);
    const columnX = Math.floor((width - columnWidth) / 2);
    const notificationsVisibleHeight = Math.min(notificationsHeight, height - height / 10 - stackHeight);
    const actorBox = new Clutter.ActorBox();

    actorBox.x1 = columnX;
    actorBox.y1 = height - notificationsVisibleHeight;
    actorBox.x2 = columnX + columnWidth;
    actorBox.y2 = actorBox.y1 + notificationsVisibleHeight;
    this.notifications.allocate(actorBox);

    const stackY = Math.min(
      Math.floor(height / 2 - FIXED_PROMPT_HEIGHT / 2),
      height - stackHeight - notificationsVisibleHeight);
    actorBox.y1 = stackY;
    actorBox.y2 = stackY + stackHeight;
    this.stack.allocate(actorBox);

    const [, , controlsWidth, controlsHeight] = this.controls.get_preferred_size();
    actorBox.x1 = width - controlsWidth;
    actorBox.y1 = height - controlsHeight;
    actorBox.x2 = width;
    actorBox.y2 = height;
    this.controls.allocate(actorBox);
  }
}

export namespace UnlockDialog {
  export interface Signals extends St.Widget.SignalSignatures {
    'failed': () => void;
    'unlocked': () => void;
    'wake-up-screen': () => void;
  }
}

export class UnlockDialog extends St.Widget {
  static [GObject.signals] = {
    'failed': {},
    'unlocked': {},
    'wake-up-screen': {},
  };

  static {
    GObject.registerClass(this);
  }

  declare connect: GObject.SignalMethods<this, UnlockDialog.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, UnlockDialog.Signals>['emit'];

  allowCancel = false;
  private readonly userName = GLib.get_user_name();
  private readonly user = AccountsService.UserManager.get_default().get_user(this.userName);
  private readonly authentication = new Authentication(connectAuthenticator);
  private readonly fingerprint = new FingerprintAuthentication();
  private authPrompt: AuthPrompt | null = null;
  private readonly promptBox = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL });
  private readonly controls = KestrelUi.lockControls();
  private readonly pages: LockPages;
  private readonly idleMonitor = global.backend.get_core_idle_monitor();
  private readonly idleWatchId: number;
  private prewarmId = 0;
  private grab: Clutter.Grab | null = null;
  private isModal = false;

  constructor(parentActor: Clutter.Actor) {
    super({
      accessible_role: Atk.Role.WINDOW,
      style_class: 'unlock-dialog',
      visible: false,
      reactive: true,
    });

    parentActor.add_child(this);

    this.add_child(new LockBackdrop().actor);

    this.fingerprint.connect('hint', (_, hint) => this.authPrompt?.setHint(hint));
    this.fingerprint.connect('succeeded', () => {
      this.authentication.cancel();
      this.authPrompt?.succeed();
    });

    const stack = new Shell.Stack();
    stack.add_child(this.promptBox);
    const clock = new Clock();
    stack.add_child(clock);

    this.pages = new LockPages({
      actor: this,
      clock,
      prompt: this.promptBox,
      companions: [this.controls.actor],
      actionMode: Shell.ActionMode.UNLOCK_SCREEN,
      preparePrompt: () => this.ensureAuthPrompt(),
      clockShown: () => this.destroyAuthPrompt(),
      focusPrompt: () => this.authPrompt!.focus(),
    });

    Main.ctrlAltTabManager.addGroup(this, 'ctrl-alt-tab-unlock', 'dialog-password-symbolic');

    const notificationsBox = new NotificationsBox();
    notificationsBox.connect('wake-up-screen', () => this.emit('wake-up-screen'));

    const mainBox = new St.Widget();
    mainBox.add_constraint(new Layout.MonitorConstraint({ primary: true }));
    mainBox.add_child(stack);
    mainBox.add_child(notificationsBox);
    mainBox.add_child(this.controls.actor);
    mainBox.layout_manager = new UnlockDialogLayout(stack, notificationsBox, this.controls.actor);
    this.add_child(mainBox);

    this.idleWatchId = this.idleMonitor.add_idle_watch(IDLE_TIMEOUT * 1000, () => {
      if (this.authPrompt && this.allowCancel) this.authPrompt.cancel();
    });

    Main.screenShield.connectObject('lock-screen-shown', () => this.schedulePrewarm(), this);

    this.connect('destroy', () => this.onDestroy());
  }

  private schedulePrewarm(): void {
    if (!this.prewarmId) this.prewarmLater(() => this.prewarmPrompt());
  }

  private prewarmLater(step: () => void): void {
    this.prewarmId = GLib.idle_add(GLib.PRIORITY_LOW, () => {
      this.prewarmId = 0;
      step();
      return GLib.SOURCE_REMOVE;
    });
  }

  private prewarmPrompt(): void {
    if (this.authPrompt) return;
    const prompt = new AuthPrompt(new RehearsedAuthentication());
    prompt.setUser(this.user);
    this.promptBox.add_child(prompt);
    keepingFocus(() => prompt.begin(this.userName));
    const pages = [this.promptBox, this.controls.actor];
    for (const page of pages) {
      Shell.util_set_hidden_from_pick(page, true);
      page.show();
    }
    this.prewarmLater(() => {
      keepingFocus(() => {
        prompt.focus();
        pages.forEach(page => Shell.util_paint_offscreen(page));
      });
      for (const page of pages) {
        Shell.util_set_hidden_from_pick(page, false);
        page.visible = page.opacity > 0;
      }
      prompt.destroy();
    });
  }

  private ensureAuthPrompt(): void {
    if (this.authPrompt) return;

    this.authPrompt = new AuthPrompt(this.authentication);
    this.authPrompt.connect('cancelled', () => this.fail());
    this.authPrompt.connect('succeeded', () => {
      this.fingerprint.cancel();
      this.emit('unlocked');
    });
    this.authPrompt.setUser(this.user);
    this.promptBox.add_child(this.authPrompt);
    this.authPrompt.begin(this.userName);
    this.fingerprint.begin(this.userName);
  }

  private destroyAuthPrompt(): void {
    if (!this.authPrompt) return;

    const focus = global.stage.key_focus;
    if (focus === null || this.authPrompt.contains(focus)) this.grab_key_focus();

    this.authentication.cancel();
    this.fingerprint.cancel();
    this.authPrompt.destroy();
    this.authPrompt = null;
  }

  private fail(): void {
    this.pages.showClock();
    this.emit('failed');
  }

  private onDestroy(): void {
    if (this.prewarmId) GLib.Source.remove(this.prewarmId);
    this.popModal();
    this.controls.destroy();
    this.idleMonitor.remove_watch(this.idleWatchId);
    this.authentication.destroy();
    this.fingerprint.destroy();
  }

  cancel(): void {
    this.authPrompt?.cancel();
  }

  open(): void {
    this.show();

    if (this.isModal) return;

    this.grab = Main.pushModal(Main.uiGroup, { actionMode: Shell.ActionMode.UNLOCK_SCREEN });
    this.isModal = true;
  }

  popModal(): void {
    if (!this.isModal) return;
    Main.popModal(this.grab!);
    this.grab = null;
    this.isModal = false;
  }
}

function keepingFocus(callback: () => void): void {
  const focus = global.stage.key_focus;
  callback();
  global.stage.set_key_focus(focus);
}
