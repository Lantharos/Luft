import AccountsService from 'gi://AccountsService';
import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import type GioUnix from 'gi://GioUnix';
import GLib from 'gi://GLib';
import type GObject from 'gi://GObject';
import Graphene from 'gi://Graphene';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as Signals from '../../core/runtime/signals.js';

import * as GnomeSession from '../../session/actions/gnomeSession.js';
import * as LoginManager from '../../session/actions/loginManager.js';
import * as KestrelUi from '../../kestrelUi.js';
import { Lightbox } from '../../shared/popups/lightbox.js';
import * as Main from '../../core/main.js';
import * as MessageTray from '../../surfaces/notifications/tray/messageTray.js';
import * as ShellDBus from '../../core/shellDBus.js';
import type { UnlockDialog } from './unlockDialog.js';

import { adjustAnimationTime } from '../../core/runtime/animationUtils.js';

const SCREENSAVER_SCHEMA = 'org.gnome.desktop.screensaver';
const LOCK_ENABLED_KEY = 'lock-enabled';
const LOCK_DELAY_KEY = 'lock-delay';


const STANDARD_FADE_TIME = 10000;
const MANUAL_FADE_TIME = 300;
const CURTAIN_SLIDE_TIME = 300;
const SHIELD_ANIMATION_TIME = 250;

interface ScreenShieldSignals {
  'active-changed': () => void;
  'lock-screen-shown': () => void;
  'wake-up-screen': () => void;
}

interface ResetParams {
  animateLockScreen: boolean;
  fadeToBlack: boolean;
}

interface ShownParams {
  fadeToBlack: boolean;
  animateFade: boolean;
}

function useMotion(): boolean {
  return St.Settings.get().reducedMotion !== St.ReducedMotion.REDUCE;
}

function defaultSeat(): Clutter.Seat {
  return global.stage.context.get_backend().get_default_seat();
}

export class ScreenShield extends Signals.EventEmitter {
  declare connect: GObject.SignalMethods<this, ScreenShieldSignals>['connect'];
  declare emit: GObject.SignalMethods<this, ScreenShieldSignals>['emit'];

  readonly actor = Main.layoutManager.screenShieldGroup;
  private lockScreenState: MessageTray.State = MessageTray.State.HIDDEN;
  private readonly lockScreenGroup = new St.Widget({
    x_expand: true,
    y_expand: true,
    reactive: true,
    can_focus: true,
    name: 'lockScreenGroup',
    visible: false,
  });

  private readonly lockDialogGroup = new St.Widget({
    x_expand: true,
    y_expand: true,
    reactive: true,
    can_focus: true,
    pivot_point: new Graphene.Point({ x: 0.5, y: 0.5 }),
    name: 'lockDialogGroup',
  });

  private readonly presence: GnomeSession.PresenceProxy;
  private readonly loginManager = LoginManager.getLoginManager();
  private loginSession: LoginManager.LoginSession | null = null;
  private readonly loginSessionReady: Promise<void>;
  private readonly settings = new Gio.Settings({ schema_id: SCREENSAVER_SCHEMA });
  private dialog: UnlockDialog | null = null;
  private grab: Clutter.Grab | null = null;
  private isActive = false;
  private isLocked = false;
  private inhibited = false;
  private inhibitCancellable: Gio.Cancellable | null = null;
  private inhibitor: GioUnix.InputStream | null = null;
  private activationTimeValue = 0;
  private becameActiveId = 0;
  private lockTimeoutId = 0;
  private fadeTimeoutId = 0;
  private cursorVisibleInhibited = false;
  private readonly longLightbox = new Lightbox(Main.uiGroup, { inhibitEvents: true, fadeFactor: 1 });
  private readonly shortLightbox = new Lightbox(Main.uiGroup, { inhibitEvents: true, fadeFactor: 1 });
  private readonly idleMonitor = global.backend.get_core_idle_monitor();
  private readonly cursorTracker = global.backend.get_cursor_tracker();
  private readonly motionListener = new Clutter.MotionController({ enabled: false });

  constructor() {
    super();

    this.actor.add_child(this.lockScreenGroup);
    this.actor.add_child(this.lockDialogGroup);

    this.presence = GnomeSession.Presence((proxy, error) => {
      if (error) {
        logError(error, 'Error while reading gnome-session presence');
        return;
      }

      this.onStatusChanged(proxy.status);
    });
    this.presence.connectSignal('StatusChanged', (_proxy, _senderName, [status]) => this.onStatusChanged(status));

    new ShellDBus.ScreenSaverDBus(this);

    this.loginManager.connect('prepare-for-sleep', (_manager, aboutToSuspend) => this.prepareForSleep(aboutToSuspend));

    this.loginSessionReady = this.watchLoginSession();

    this.settings.connect(`changed::${LOCK_ENABLED_KEY}`, () => void this.syncInhibitor());

    this.longLightbox.connect('notify::active', lightbox => {
      if (lightbox.active) this.activate(false);
    });
    this.shortLightbox.connect('notify::active', lightbox => {
      if (lightbox.active) this.setActive(true);
    });

    this.motionListener.connect('motion', () => this.showPointer());
    this.lockDialogGroup.add_action(this.motionListener);

    void this.syncInhibitor();
  }

  private async watchLoginSession(): Promise<void> {
    this.loginSession = await this.loginManager.getCurrentSessionProxy();
    const session = this.loginSession!;
    session.connectSignal('Lock', () => this.lock(false));
    session.connectSignal('Unlock', () => this.deactivate(false));
    session.connect('g-properties-changed', () => void this.syncInhibitor());
    void this.syncInhibitor();
  }

  private setActive(active: boolean): void {
    const prevIsActive = this.isActive;
    this.isActive = active;

    if (prevIsActive !== this.isActive) this.emit('active-changed');

    void this.syncInhibitor();
  }

  private setLocked(locked: boolean): void {
    this.isLocked = locked;
    this.loginSession?.SetLockedHintAsync(locked).catch(logError);
  }

  private becomeModal(): void {
    if (this.grab) return;

    this.grab = Main.pushModal(Main.uiGroup, { actionMode: Shell.ActionMode.LOCK_SCREEN });
  }

  private async syncInhibitor(): Promise<void> {
    const lockEnabled = this.settings.get_boolean(LOCK_ENABLED_KEY);
    const inhibit = !!this.loginSession && this.loginSession.Active &&
      !this.isActive && lockEnabled &&
      !!Main.sessionMode.unlockDialog;

    if (inhibit === this.inhibited) return;

    this.inhibited = inhibit;

    this.inhibitCancellable?.cancel();
    this.inhibitCancellable = new Gio.Cancellable();

    if (inhibit) {
      try {
        this.inhibitor = await this.loginManager.inhibit(KestrelUi.t('lock-inhibit-reason'), this.inhibitCancellable);
      } catch (e) {
        if (!(e as GLib.Error).matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED))
          log(`Failed to inhibit suspend: ${(e as GLib.Error).message}`);
      }
    } else {
      this.inhibitor?.close(null);
      this.inhibitor = null;
    }
  }

  private prepareForSleep(aboutToSuspend: boolean): void {
    if (aboutToSuspend) {
      this.dialog?.cancel();
      if (this.settings.get_boolean(LOCK_ENABLED_KEY)) this.lock(true);
    } else {
      this.wakeUpScreen();
    }
  }

  private onStatusChanged(status: number): void {
    if (status !== GnomeSession.PresenceStatus.IDLE) return;

    this.dialog?.cancel();

    if (this.longLightbox.visible) return;

    this.becomeModal();

    if (this.activationTimeValue === 0) this.activationTimeValue = GLib.get_monotonic_time();

    if (this.settings.get_boolean(LOCK_ENABLED_KEY) && !this.isLocked) {
      const lockTimeout = Math.max(adjustAnimationTime(STANDARD_FADE_TIME), this.settings.get_uint(LOCK_DELAY_KEY) * 1000);
      this.lockTimeoutId = GLib.timeout_add_once(GLib.PRIORITY_DEFAULT, lockTimeout, () => {
        this.lockTimeoutId = 0;
        this.lock(false);
      });
      GLib.Source.set_name_by_id(this.lockTimeoutId, '[kestrel] this.lock');
    }

    this.activateFade(this.longLightbox, STANDARD_FADE_TIME);
  }

  private activateFade(lightbox: Lightbox, time: number): void {
    Main.uiGroup.set_child_above_sibling(lightbox, null);
    lightbox.lightOn(time);

    if (this.becameActiveId === 0) this.becameActiveId = this.idleMonitor.add_user_active_watch(() => this.onUserBecameActive());
  }

  private onUserBecameActive(): void {
    this.idleMonitor.remove_watch(this.becameActiveId);
    this.becameActiveId = 0;

    if (this.isLocked) {
      this.longLightbox.lightOff();
      this.shortLightbox.lightOff();
    } else {
      this.deactivate(false);
    }
  }

  private hideLockScreenComplete(): void {
    this.lockScreenState = MessageTray.State.HIDDEN;
    this.lockScreenGroup.hide();

    if (this.dialog) {
      this.dialog.grab_key_focus();
      this.dialog.navigate_focus(null, St.DirectionType.TAB_FORWARD, false);
    }
  }

  private showPointer(): void {
    if (this.cursorVisibleInhibited) {
      const seat = defaultSeat();
      this.cursorTracker.uninhibit_cursor_visibility();
      seat.uninhibit_unfocus();
      this.cursorVisibleInhibited = false;
    }

    this.motionListener.enabled = false;
  }

  private hidePointerUntilMotion(): void {
    this.motionListener.enabled = true;
    if (this.cursorVisibleInhibited) return;

    const seat = defaultSeat();
    seat.inhibit_unfocus();
    this.cursorTracker.inhibit_cursor_visibility();
    this.cursorVisibleInhibited = true;
  }

  private hideLockScreen(animate: boolean, onHidden: () => void): void {
    if (this.lockScreenState === MessageTray.State.HIDDEN) {
      onHidden();
      return;
    }

    this.lockScreenState = MessageTray.State.HIDING;

    this.lockDialogGroup.remove_all_transitions();

    const height = global.stage.height;
    const delta = height + this.lockDialogGroup.translation_y;
    const velocity = height / CURTAIN_SLIDE_TIME;
    const duration = animate ? delta / velocity : 0;

    this.lockDialogGroup.ease({
      ...useMotion() ? { translation_y: -height } : { opacity: 0 },
      duration,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      onComplete: () => {
        this.hideLockScreenComplete();
        onHidden();
      },
    });

    this.showPointer();
  }

  private ensureUnlockDialog(allowCancel: boolean): boolean {
    if (!this.dialog) {
      const constructor = Main.sessionMode.unlockDialog;
      if (!constructor) {
        this.deactivate(true);
        return false;
      }

      this.dialog = new constructor(this.lockDialogGroup);
      this.dialog.open();

      this.dialog.connect('failed', () => this.resetLockScreen({ animateLockScreen: true, fadeToBlack: false }));
      this.dialog.connect('unlocked', () => this.deactivate(true));
      this.dialog.connect('wake-up-screen', () => this.wakeUpScreen());
    }

    this.dialog.allowCancel = allowCancel;
    this.dialog.grab_key_focus();
    return true;
  }

  private resetLockScreen({ animateLockScreen, fadeToBlack }: ResetParams): void {
    if (this.lockScreenState !== MessageTray.State.HIDDEN) return;

    this.lockScreenGroup.show();
    this.lockScreenState = MessageTray.State.SHOWING;

    if (animateLockScreen) {
      const motion = useMotion();
      if (motion) this.lockDialogGroup.translation_y = -global.screen_height;
      else this.lockDialogGroup.opacity = 0;

      this.lockDialogGroup.remove_all_transitions();
      this.lockDialogGroup.ease({
        ...motion ? { translation_y: 0 } : { opacity: 255 },
        duration: SHIELD_ANIMATION_TIME,
        mode: Clutter.AnimationMode.EASE_OUT_QUAD,
        onComplete: () => this.lockScreenShown({ fadeToBlack, animateFade: true }),
      });
    } else {
      this.lockDialogGroup.translation_y = 0;
      this.lockDialogGroup.opacity = 255;
      this.lockScreenShown({ fadeToBlack, animateFade: false });
    }

    this.dialog!.grab_key_focus();
  }

  private lockScreenShown({ fadeToBlack, animateFade }: ShownParams): void {
    this.hidePointerUntilMotion();

    this.lockScreenState = MessageTray.State.SHOWN;

    if (fadeToBlack && animateFade) {
      this.fadeTimeoutId = GLib.timeout_add_once(GLib.PRIORITY_DEFAULT, MANUAL_FADE_TIME, () => {
        this.fadeTimeoutId = 0;
        this.activateFade(this.shortLightbox, MANUAL_FADE_TIME);
      });
      GLib.Source.set_name_by_id(this.fadeTimeoutId, '[kestrel] this._activateFade');
    } else {
      if (fadeToBlack) this.activateFade(this.shortLightbox, 0);

      this.setActive(true);
    }

    this.emit('lock-screen-shown');
  }

  private wakeUpScreen(): void {
    if (this.lockScreenState === MessageTray.State.SHOWING) this.showLockScreenAwake();
    else if (this.lockScreenState === MessageTray.State.SHOWN && !this.active) this.stopFadingToBlack();
    else if (!this.active) return;
    this.onUserBecameActive();
    this.emit('wake-up-screen');
  }

  private showLockScreenAwake(): void {
    this.lockDialogGroup.remove_all_transitions();
    this.lockDialogGroup.translation_y = 0;
    this.lockDialogGroup.opacity = 255;
    this.lockScreenShown({ fadeToBlack: false, animateFade: false });
  }

  private stopFadingToBlack(): void {
    this.cancelFade();
    this.shortLightbox.lightOff();
    this.setActive(true);
  }

  private cancelFade(): void {
    if (this.fadeTimeoutId === 0) return;
    GLib.source_remove(this.fadeTimeoutId);
    this.fadeTimeoutId = 0;
  }

  get locked(): boolean {
    return this.isLocked;
  }

  get active(): boolean {
    return this.isActive;
  }

  get activationTime(): number {
    return this.activationTimeValue;
  }

  deactivate(animate: boolean): void {
    if (Main.sessionMode.currentMode === 'unlock-dialog') Main.sessionMode.popMode('unlock-dialog');

    this.emit('wake-up-screen');

    this.dialog?.popModal();

    if (this.grab) {
      Main.popModal(this.grab);
      this.grab = null;
    }

    this.longLightbox.lightOff();
    this.shortLightbox.lightOff();
    this.hideLockScreen(animate, () => this.completeDeactivate());
  }

  private completeDeactivate(): void {
    if (this.dialog) {
      this.dialog.destroy();
      this.dialog = null;
    }

    this.actor.hide();

    if (this.becameActiveId !== 0) {
      this.idleMonitor.remove_watch(this.becameActiveId);
      this.becameActiveId = 0;
    }

    if (this.lockTimeoutId !== 0) {
      GLib.source_remove(this.lockTimeoutId);
      this.lockTimeoutId = 0;
    }

    this.cancelFade();
    this.activationTimeValue = 0;
    this.setActive(false);
    this.setLocked(false);
  }

  activate(animate: boolean): void {
    if (this.activationTimeValue === 0) this.activationTimeValue = GLib.get_monotonic_time();

    if (!this.ensureUnlockDialog(true)) return;

    this.actor.show();

    if (Main.sessionMode.currentMode !== 'unlock-dialog') Main.sessionMode.pushMode('unlock-dialog');

    this.resetLockScreen({ animateLockScreen: animate, fadeToBlack: true });
  }

  lock(animate: boolean): void {
    this.becomeModal();

    St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, '');
    St.Clipboard.get_default().set_text(St.ClipboardType.PRIMARY, '');

    const user = AccountsService.UserManager.get_default().get_user(GLib.get_user_name());

    this.activate(animate);

    this.setLocked(user.password_mode !== AccountsService.UserPasswordMode.NONE);
  }

  async lockIfWasLocked(): Promise<void> {
    await this.loginSessionReady;
    if (this.loginSession?.LockedHint) this.lock(false);
  }
}
