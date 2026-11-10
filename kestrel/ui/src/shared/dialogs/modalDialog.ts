import { freezeSelection } from '../../appearance/kestrelGlass.js';
import Atk from 'gi://Atk';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Shell from 'gi://Shell';
import St from 'gi://St';

import { Curve, Duration } from '../motion/motion.js';
import * as Dialog from './dialog.js';
import * as Layout from '../../core/stage/layout.js';
import * as Lightbox from '../popups/lightbox.js';
import * as Main from '../../core/main.js';
import { promptGate, type WhileLocked } from './promptGate.js';

export type { ButtonInfo } from './dialog.js';

const OPEN_RISE_DISTANCE = 16;
const PROMPT_SETTLE_TIME = 750;
const POINTER_EVENTS = new Set([
  Clutter.EventType.BUTTON_PRESS, Clutter.EventType.BUTTON_RELEASE,
  Clutter.EventType.TOUCH_BEGIN, Clutter.EventType.TOUCH_UPDATE, Clutter.EventType.TOUCH_END,
]);

export const State = {
  OPENED: 0,
  CLOSED: 1,
  OPENING: 2,
  CLOSING: 3,
  FADED_OUT: 4,
} as const;
export type State = typeof State[keyof typeof State];

interface ModalDialogOptions {
  styleClass?: string | null;
  actionMode?: Shell.ActionMode;
  destroyOnClose?: boolean;
  prompt?: boolean;
  whileLocked?: WhileLocked;
}

export namespace ModalDialog {
  export interface Signals extends St.Widget.SignalSignatures {
    'opened': () => void;
    'closed': () => void;
    'notify::state': (pspec: GObject.ParamSpec) => void;
  }
}

export const ModalDialog = GObject.registerClass({
  Properties: {
    'state': GObject.ParamSpec.int('state', null, null, GObject.ParamFlags.READABLE,
      Math.min(...Object.values(State)), Math.max(...Object.values(State)), State.CLOSED),
  },
  Signals: { 'opened': {}, 'closed': {} },
}, class ModalDialog extends St.Widget {
  declare connect: GObject.SignalMethods<this, ModalDialog.Signals>['connect'];
  declare connect_after: GObject.SignalMethods<this, ModalDialog.Signals>['connect_after'];
  declare emit: GObject.SignalMethods<this, ModalDialog.Signals>['emit'];

  declare backgroundStack: St.Widget;
  declare dialogLayout: Dialog.Dialog;
  declare contentLayout: St.BoxLayout;
  declare buttonLayout: St.Widget;
  declare private currentState: State;
  declare private hasModal: boolean;
  declare private actionMode: Shell.ActionMode;
  declare private destroyOnClose: boolean;
  declare private backgroundBin: St.Bin;
  declare private monitorConstraint: InstanceType<typeof Layout.MonitorConstraint>;
  declare private lightbox: InstanceType<typeof Lightbox.Lightbox>;
  declare private eventBlocker: Clutter.Actor;
  declare private initialKeyFocus: St.Widget | null;
  declare private savedKeyFocus: Clutter.Actor | null;
  declare private modalGrab: Clutter.Grab | null | undefined;
  declare private clearClosingSelection: (() => void) | null | undefined;
  declare private prompt: boolean;
  declare whileLocked: WhileLocked;
  declare private waited: boolean;
  declare private earlyInputId: number;
  declare private settling: number;
  declare private earlyKeys: Set<number>;

  _init({
    styleClass = null,
    actionMode = Shell.ActionMode.SYSTEM_MODAL,
    destroyOnClose = true,
    prompt = false,
    whileLocked = 'wait',
  }: ModalDialogOptions = {}): void {
    super._init({
      visible: false,
      reactive: true,
      x: 0,
      y: 0,
      accessible_role: Atk.Role.DIALOG,
    });

    this.currentState = State.CLOSED;
    this.hasModal = false;
    this.actionMode = actionMode;
    this.destroyOnClose = destroyOnClose;

    Main.layoutManager.modalDialogGroup.add_child(this);

    this.add_constraint(new Clutter.BindConstraint({
      source: global.stage,
      coordinate: Clutter.BindCoordinate.ALL,
    }));

    this.backgroundStack = new St.Widget({
      layout_manager: new Clutter.BinLayout(),
      x_expand: true,
      y_expand: true,
    });
    this.backgroundBin = new St.Bin({ child: this.backgroundStack });
    this.monitorConstraint = new Layout.MonitorConstraint();
    this.backgroundBin.add_constraint(this.monitorConstraint);
    this.add_child(this.backgroundBin);

    this.dialogLayout = new Dialog.Dialog(this.backgroundStack, styleClass);
    this.contentLayout = this.dialogLayout.contentLayout;
    this.buttonLayout = this.dialogLayout.buttonLayout;

    this.lightbox = new Lightbox.Lightbox(this, {
      inhibitEvents: true,
      radialEffect: true,
    });
    this.lightbox.highlight(this.backgroundBin);

    this.eventBlocker = new Clutter.Actor({ reactive: true });
    this.backgroundStack.add_child(this.eventBlocker);

    global.focus_manager.add_group(this.dialogLayout);
    this.initialKeyFocus = null;
    this.savedKeyFocus = null;

    this.prompt = prompt;
    this.whileLocked = whileLocked;
    this.waited = false;
    this.earlyInputId = 0;
    this.settling = 0;
    this.earlyKeys = new Set();
    this.connect('destroy', () => {
      promptGate.forget(this);
      this.stopSettling();
    });
  }

  private holdEarlyInput(event: Clutter.Event): boolean {
    const type = event.type();
    if (type === Clutter.EventType.KEY_PRESS) {
      const code = event.get_key_code();
      if (!this.settling && !this.earlyKeys.has(code)) return Clutter.EVENT_PROPAGATE;
      this.earlyKeys.add(code);
      return Clutter.EVENT_STOP;
    }
    if (type === Clutter.EventType.KEY_RELEASE)
      return this.earlyKeys.delete(event.get_key_code()) ? Clutter.EVENT_STOP : Clutter.EVENT_PROPAGATE;
    return this.settling && POINTER_EVENTS.has(type) ? Clutter.EVENT_STOP : Clutter.EVENT_PROPAGATE;
  }

  private startSettling(): void {
    this.stopSettling();
    this.earlyInputId ||= this.connect('captured-event', (_actor, event: Clutter.Event) => this.holdEarlyInput(event));
    this.settling = GLib.timeout_add(GLib.PRIORITY_DEFAULT, PROMPT_SETTLE_TIME, () => {
      this.settling = 0;
      return GLib.SOURCE_REMOVE;
    });
  }

  private stopSettling(): void {
    if (this.settling) GLib.source_remove(this.settling);
    this.settling = 0;
  }

  get state(): State {
    return this.currentState;
  }

  get answerable(): boolean {
    return !this.settling;
  }

  private setState(state: State): void {
    if (this.currentState === state) return;
    this.currentState = state;
    this.notify('state');
  }

  clearButtons(): void {
    this.dialogLayout.clearButtons();
  }

  setButtons(buttons: Dialog.ButtonInfo[]): void {
    this.clearButtons();
    for (const buttonInfo of buttons) this.addButton(buttonInfo);
  }

  addButton(buttonInfo: Dialog.ButtonInfo): St.Button {
    return this.dialogLayout.addButton(buttonInfo);
  }

  private fadeOpen(): void {
    this.monitorConstraint.index = global.display.get_current_monitor();

    this.setState(State.OPENING);

    this.dialogLayout.opacity = 255;
    this.lightbox.lightOn();
    this.opacity = 0;
    this.show();
    this.dialogLayout.translation_y = OPEN_RISE_DISTANCE;
    this.dialogLayout.ease({
      translation_y: 0,
      duration: Duration.moderate,
      curve: Curve.settle,
    });
    this.ease({
      opacity: 255,
      duration: Duration.tap,
      curve: Curve.gentle,
      onComplete: () => {
        this.setState(State.OPENED);
        this.emit('opened');
      },
    });
  }

  setInitialKeyFocus(actor: St.Widget): void {
    this.initialKeyFocus?.disconnectObject(this);
    this.initialKeyFocus = actor;
    actor.connectObject('destroy', () => (this.initialKeyFocus = null), this);
  }

  open(): boolean {
    this.clearClosingSelection?.();
    this.clearClosingSelection = null;
    if (this.state === State.OPENED || this.state === State.OPENING) return true;

    if (!promptGate.admits(this)) {
      if (this.whileLocked === 'refuse') return false;
      this.leaveStage();
      return true;
    }

    const group = Main.layoutManager.modalDialogGroup;
    if (this.get_parent() !== group) group.add_child(this);
    if (!this.pushModal()) return false;

    if (this.prompt || this.waited) this.startSettling();
    this.waited = false;
    this.fadeOpen();
    return true;
  }

  holdBack(): void {
    this.popModal();
    this.remove_all_transitions();
    this.dialogLayout.remove_all_transitions();
    this.hide();
    this.setState(State.CLOSED);
    this.leaveStage();
  }

  private leaveStage(): void {
    this.waited = true;
    this.get_parent()?.remove_child(this);
  }

  private closeComplete(): void {
    this.setState(State.CLOSED);
    this.hide();
    this.emit('closed');

    if (this.destroyOnClose) this.destroy();
  }

  close(): void {
    if (promptGate.forget(this)) {
      this.closeComplete();
      return;
    }

    this.clearClosingSelection ??= freezeSelection(this.dialogLayout);
    if (this.state === State.CLOSED || this.state === State.CLOSING) return;

    this.setState(State.CLOSING);
    this.popModal();
    this.savedKeyFocus = null;

    this.ease({
      opacity: 0,
      duration: Duration.tap,
      curve: Curve.gentle,
      onComplete: () => this.closeComplete(),
    });
  }

  popModal(): void {
    if (!this.hasModal) return;

    const focus = global.stage.key_focus;
    this.savedKeyFocus = focus && this.contains(focus) ? focus : null;
    Main.popModal(this.modalGrab!);
    this.modalGrab = null;
    this.hasModal = false;

    this.backgroundStack.set_child_above_sibling(this.eventBlocker, null);
  }

  pushModal(): boolean {
    if (this.hasModal) return true;

    this.modalGrab = Main.pushModal(this, { actionMode: this.actionMode });
    Main.layoutManager.emit('system-modal-opened');

    this.hasModal = true;
    if (this.savedKeyFocus) {
      this.savedKeyFocus.grab_key_focus();
      this.savedKeyFocus = null;
    } else {
      (this.initialKeyFocus || this.dialogLayout.initialKeyFocus).grab_key_focus();
    }

    this.backgroundStack.set_child_below_sibling(this.eventBlocker, null);
    return true;
  }

  fadeOutDialog(): void {
    if (this.state === State.CLOSED || this.state === State.CLOSING || this.state === State.FADED_OUT) return;

    this.popModal();
    this.dialogLayout.ease({
      opacity: 0,
      duration: Duration.linger,
      curve: Curve.gentle,
      onComplete: () => this.setState(State.FADED_OUT),
    });
  }
});
export type ModalDialog = InstanceType<typeof ModalDialog>;
