import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as Dialog from '../../shared/dialogs/dialog.js';
import * as KestrelUi from '../../kestrelUi.js';

const FROZEN_WINDOW_BRIGHTNESS = -0.3;
const FROZEN_WINDOW_EFFECT = 'kestrel-frozen-window';
const DIALOG_TRANSITION_TIME = 150;
const ALIVE_TIMEOUT = 5000;
const GAME_GRACE_TIMEOUT = 60000;

export const CloseDialog = GObject.registerClass({
  Implements: [Meta.CloseDialog],
  Properties: {
    'window': GObject.ParamSpec.override('window', Meta.CloseDialog),
  },
}, class CloseDialog extends GObject.Object {
  declare response: (response: Meta.CloseDialogResponse) => void;

  private dialog: Dialog.Dialog | null = null;
  private timeoutId = 0;
  private graceId = 0;

  constructor(private currentWindow: Meta.Window) {
    super();
  }

  get window(): Meta.Window {
    return this.currentWindow;
  }

  set window(window: Meta.Window) {
    this.currentWindow = window;
  }

  private get windowActor(): Meta.WindowActor {
    return this.currentWindow.get_compositor_private() as Meta.WindowActor;
  }

  private createDialogContent(): Dialog.MessageDialogContent {
    const windowApp = Shell.WindowTracker.get_default().get_window_app(this.currentWindow)!;

    return new Dialog.MessageDialogContent({
      title: KestrelUi.t('close-dialog-title', { appName: windowApp.get_name() }),
      description: KestrelUi.t('close-dialog-description'),
      iconName: 'dialog-warning-symbolic',
    });
  }

  private updateScale(dialog: Dialog.Dialog): void {
    if (this.currentWindow.get_client_type() !== Meta.WindowClientType.WAYLAND) return;

    const { scaleFactor } = St.ThemeContext.get_for_stage(global.stage);
    dialog.set_scale(1 / scaleFactor, 1 / scaleFactor);
  }

  private createDialog(): Dialog.Dialog {
    const windowActor = this.windowActor;
    const dialog = new Dialog.Dialog(windowActor, 'close-dialog');
    dialog.width = windowActor.width;
    dialog.height = windowActor.height;

    dialog.contentLayout.add_child(this.createDialogContent());
    dialog.addButton({
      label: KestrelUi.t('close-dialog-force-quit'),
      action: () => this.response(Meta.CloseDialogResponse.FORCE_CLOSE),
      default: true,
    });
    dialog.addButton({
      label: KestrelUi.t('close-dialog-wait'),
      action: () => this.wait(),
      key: Clutter.KEY_Escape,
    });

    global.focus_manager.add_group(dialog);

    St.ThemeContext.get_for_stage(global.stage).connectObject('notify::scale-factor', () => this.updateScale(dialog), dialog);
    this.updateScale(dialog);
    return dialog;
  }

  private get surfaceActor(): Clutter.Actor {
    return this.windowActor.get_first_child()!;
  }

  private addWindowEffect(): void {
    const effect = new Clutter.BrightnessContrastEffect();
    effect.set_brightness(FROZEN_WINDOW_BRIGHTNESS);
    this.surfaceActor.add_effect_with_name(FROZEN_WINDOW_EFFECT, effect);
  }

  private wait(): void {
    this.response(Meta.CloseDialogResponse.WAIT);
  }

  private isGame(): boolean {
    return this.currentWindow.is_fullscreen() || KestrelUi.isGame(this.currentWindow);
  }

  vfunc_show(): void {
    if (this.dialog != null || this.graceId) return;

    if (this.isGame()) {
      this.graceId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, GAME_GRACE_TIMEOUT, () => {
        this.graceId = 0;
        this.present();
        return GLib.SOURCE_REMOVE;
      });
      return;
    }

    this.present();
  }

  private present(): void {
    global.compositor.disable_unredirect();

    this.timeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, ALIVE_TIMEOUT, () => {
      this.currentWindow.check_alive(global.display.get_current_time_roundtrip());
      return GLib.SOURCE_CONTINUE;
    });

    this.addWindowEffect();
    const dialog = this.dialog = this.createDialog();
    KestrelUi.playSound('warning');

    global.connectObject('shutdown', () => this.wait(), dialog);

    dialog.surface.set_pivot_point(0.5, 0.5);
    dialog.surface.scale_x = 0.8;
    dialog.surface.scale_y = 0.8;

    dialog.surface.ease({
      scale_x: 1,
      scale_y: 1,
      mode: Clutter.AnimationMode.EASE_OUT_BACK,
      duration: DIALOG_TRANSITION_TIME,
    });
  }

  vfunc_hide(): void {
    if (this.graceId) {
      GLib.source_remove(this.graceId);
      this.graceId = 0;
    }

    const dialog = this.dialog;
    if (dialog == null) return;

    global.compositor.enable_unredirect();

    GLib.source_remove(this.timeoutId);
    this.timeoutId = 0;

    dialog.surface.remove_all_transitions();

    this.dialog = null;
    this.surfaceActor.remove_effect_by_name(FROZEN_WINDOW_EFFECT);

    dialog.makeInactive();
    dialog.surface.ease({
      opacity: 0,
      scale_x: 0.8,
      scale_y: 0.8,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      duration: DIALOG_TRANSITION_TIME,
      onComplete: () => dialog.destroy(),
    });
  }

  vfunc_focus(): void {
    if (!this.dialog) return;

    const keyFocus = global.stage.key_focus;
    if (!keyFocus || !this.dialog.contains(keyFocus))
      this.dialog.initialKeyFocus.grab_key_focus();
  }
});
export type CloseDialog = InstanceType<typeof CloseDialog>;
