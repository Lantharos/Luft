import AccountsService from 'gi://AccountsService';
import Atk from 'gi://Atk';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as KestrelUi from '../../kestrelUi.js';
import * as Main from '../../core/main.js';
import { Curve, reducedMotion } from '../../shared/motion/motion.js';
import { Authentication } from '../prompt/authentication.js';
import { AuthPrompt } from '../prompt/authPrompt.js';
import { connectAuthenticator } from '../prompt/greetd.js';
import { Monument } from '../monument/monument.js';
import { LockBackdrop } from './backdrop.js';
import { NotificationsBox } from './notifications.js';
import { LockFingerprint } from './lockFingerprint.js';
import { rememberMethod } from './signInMethod.js';

const IDLE_TIMEOUT = 2 * 60;
const LIFT_TIME = 560;
const FROST_SCALE = 1.04;
const UI_SCALE = 1.03;
const UI_SHARE = 0.4;
const UI_DELAY = 0.35;

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
  private readonly fingerprint: LockFingerprint;
  private authPrompt: AuthPrompt | null = null;
  private promptActive = false;
  private readonly promptBox = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL });
  private readonly controls = KestrelUi.lockControls();
  private readonly frost = new LockBackdrop().actor;
  private readonly monument: Monument;
  private readonly idleMonitor = global.backend.get_core_idle_monitor();
  private readonly idleWatchId: number;
  private prewarmId = 0;
  private grab: Clutter.Grab | null = null;
  private isModal = false;

  constructor(parentActor: Clutter.Actor) {
    super({
      accessible_role: Atk.Role.WINDOW,
      style_class: 'kestrel-lock',
      visible: false,
      reactive: true,
    });

    parentActor.add_child(this);

    this.frost.set_pivot_point(0.5, 0.5);
    this.add_child(this.frost);

    const notificationsBox = new NotificationsBox();
    notificationsBox.connect('wake-up-screen', () => this.emit('wake-up-screen'));

    this.monument = new Monument({
      root: this,
      auth: this.promptBox,
      side: notificationsBox,
      controls: this.controls.actor,
      actionMode: Shell.ActionMode.UNLOCK_SCREEN,
      preparePrompt: () => this.ensureAuthPrompt(),
      asleep: () => this.restAuthPrompt(),
      focusPrompt: typed => this.authPrompt!.focus(typed),
    });
    this.monument.actor.set_pivot_point(0.5, 0.5);
    this.add_child(this.monument.actor);

    this.fingerprint = new LockFingerprint({
      userName: this.userName,
      promptShown: () => this.monument.wake.promptShown,
      unlock: () => this.unlockWithFingerprint(),
    });

    Main.ctrlAltTabManager.addGroup(this, 'ctrl-alt-tab-unlock', 'dialog-password-symbolic');
    Main.keyboard.connectObject('visibility-changed', () => {
      this.monument.keyboardHeight = Main.keyboard.visible ? Main.layoutManager.keyboardBox.height : 0;
    }, this);

    this.idleWatchId = this.idleMonitor.add_idle_watch(IDLE_TIMEOUT * 1000, () => {
      if (this.promptActive && this.allowCancel) this.authPrompt!.cancel();
    });

    Main.screenShield.connectObject('lock-screen-shown', () => {
      this.fingerprint.start();
      this.schedulePrewarm();
    }, this);

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
    const page = this.promptBox;
    if (this.promptActive || page.get_n_children()) return;
    this.createAuthPrompt();
    Shell.util_set_hidden_from_pick(page, true);
    page.show();
    this.prewarmLater(() => {
      Shell.util_paint_offscreen(page);
      Shell.util_set_hidden_from_pick(page, false);
      page.visible = page.opacity > 0;
    });
  }

  private createAuthPrompt(): AuthPrompt {
    if (this.authPrompt) return this.authPrompt;
    const prompt = new AuthPrompt(this.authentication);
    prompt.connect('cancelled', () => this.fail());
    prompt.connect('succeeded', () => {
      if (!this.fingerprint.matched) rememberMethod('password');
      this.fingerprint.cancel();
      this.emit('unlocked');
    });
    prompt.setUser(this.user);
    this.promptBox.add_child(prompt);
    this.authPrompt = prompt;
    return prompt;
  }

  private ensureAuthPrompt(): void {
    if (this.promptActive) return;
    const prompt = this.createAuthPrompt();
    this.promptActive = true;
    prompt.begin(this.userName);
    this.fingerprint.attach(prompt);
  }

  private unlockWithFingerprint(): void {
    this.authentication.cancel();
    if (this.promptActive) this.authPrompt!.succeed();
    else this.emit('unlocked');
  }

  private restAuthPrompt(): void {
    if (!this.promptActive) return;

    const focus = global.stage.key_focus;
    if (focus === null || this.authPrompt!.contains(focus)) this.grab_key_focus();

    this.promptActive = false;
    this.authentication.cancel();
    this.fingerprint.detach();
  }

  private fail(): void {
    this.monument.wake.sleep();
    this.emit('failed');
  }

  lift(locking: boolean, onComplete: () => void): void {
    const ui = this.monument.actor;
    for (const actor of [this.frost, ui]) actor.remove_all_transitions();
    if (reducedMotion()) {
      this.frost.set({ opacity: 255, scale_x: 1, scale_y: 1 });
      ui.set({ scale_x: 1, scale_y: 1 });
      ui.opacity = locking ? 0 : 255;
      ui.ease({ opacity: locking ? 255 : 0, duration: LIFT_TIME * UI_SHARE, curve: Curve.decelerate, onComplete });
      return;
    }
    const frostScale = locking ? FROST_SCALE : 1;
    const uiScale = locking ? 1 : UI_SCALE;
    this.frost.set({ opacity: locking ? 0 : 255, scale_x: locking ? 1 : FROST_SCALE, scale_y: locking ? 1 : FROST_SCALE });
    ui.set({ opacity: locking ? 0 : 255, scale_x: locking ? UI_SCALE : 1, scale_y: locking ? UI_SCALE : 1 });
    this.frost.ease({ opacity: locking ? 255 : 0, scale_x: frostScale, scale_y: frostScale, duration: LIFT_TIME, curve: Curve.decelerate, onComplete });
    ui.ease({
      opacity: locking ? 255 : 0, scale_x: uiScale, scale_y: uiScale,
      duration: LIFT_TIME * UI_SHARE, delay: locking ? LIFT_TIME * UI_DELAY : 0, curve: Curve.decelerate,
    });
  }

  rest(): void {
    for (const actor of [this.frost, this.monument.actor]) {
      actor.remove_all_transitions();
      actor.set({ opacity: 255, scale_x: 1, scale_y: 1 });
    }
    this.frost.set({ scale_x: FROST_SCALE, scale_y: FROST_SCALE });
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
    if (this.promptActive) this.authPrompt!.cancel();
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

