import Atk from 'gi://Atk';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';

import * as KestrelUi from '../../kestrelUi.js';
import { Curve, Duration, Spring } from '../../shared/motion/motion.js';
import * as ShellEntry from '../../shared/widgets/shellEntry.js';
import { FingerprintGlyph } from './fingerprintGlyph.js';
import { describeFingerprint, type FingerprintState } from './fingerprintState.js';
import { PasswordField } from './passwordField.js';

const HIDDEN_DROP = 6;

export namespace MethodArea {
  export interface Signals extends St.Widget.SignalSignatures {
    'use-password': () => void;
    'use-fingerprint': () => void;
  }
}

function quiet(name: string): St.Button {
  return new St.Button({ name, style_class: 'kestrel-auth-quiet', can_focus: true, x_align: Clutter.ActorAlign.START, visible: false });
}

function label(styleClass: string): St.Label {
  const text = new St.Label({ style_class: styleClass, y_align: Clutter.ActorAlign.CENTER });
  text.clutter_text.line_wrap = true;
  return text;
}

function swapText(text: St.Label, value: string): void {
  if (text.text === value) return;
  text.ease({
    opacity: 0, duration: Duration.tap, curve: Curve.decelerate,
    onStopped: () => {
      text.text = value;
      text.visible = value !== '';
      text.ease({ opacity: 255, duration: Duration.quick, curve: Curve.decelerate });
    },
  });
}

export class MethodArea extends St.Widget {
  static [GObject.signals] = {
    'use-password': {},
    'use-fingerprint': {},
  };

  static {
    GObject.registerClass(this);
  }

  declare connect: GObject.SignalMethods<this, MethodArea.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, MethodArea.Signals>['emit'];

  readonly glyph = new FingerprintGlyph();
  readonly field = new PasswordField();
  readonly usePassword = quiet('kestrel-auth-use-password');
  private readonly useFingerprint = quiet('kestrel-auth-use-fingerprint');
  private readonly hint = label('kestrel-auth-hint');
  private readonly message = label('kestrel-auth-message');
  private readonly fingerprintRow = new St.BoxLayout({ style_class: 'kestrel-auth-fingerprint', x_align: Clutter.ActorAlign.START, y_align: Clutter.ActorAlign.START });
  private readonly passwordColumn = new St.BoxLayout({ style_class: 'kestrel-auth-password', orientation: Clutter.Orientation.VERTICAL, y_align: Clutter.ActorAlign.START });
  private fingerprintPrimary = false;
  private fingerprintText = '';

  constructor() {
    super({ layout_manager: new Clutter.BinLayout(), x_align: Clutter.ActorAlign.START });

    const fingerprintText = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, y_align: Clutter.ActorAlign.CENTER });
    fingerprintText.add_child(this.hint);
    fingerprintText.add_child(this.usePassword);
    this.fingerprintRow.add_child(this.glyph);
    this.fingerprintRow.add_child(fingerprintText);
    this.usePassword.show();
    KestrelUi.localized(this.usePassword, () => (this.usePassword.label = KestrelUi.t('auth-prompt-use-password')));
    this.usePassword.connect('clicked', () => this.emit('use-password'));

    const row = new St.BoxLayout({ style_class: 'kestrel-auth-row' });
    row.add_child(this.message);
    row.add_child(new ShellEntry.CapsLockWarning({ style_class: 'caps-lock-warning-label kestrel-auth-message', y_align: Clutter.ActorAlign.CENTER }));
    row.add_child(this.useFingerprint);
    this.useFingerprint.connect('clicked', () => this.emit('use-fingerprint'));
    this.passwordColumn.add_child(this.field);
    this.passwordColumn.add_child(row);
    this.message.hide();

    for (const method of [this.fingerprintRow, this.passwordColumn]) {
      method.set_pivot_point(0, 0);
      this.add_child(method);
    }
    this.fingerprintRow.set({ opacity: 0, visible: false, translation_y: HIDDEN_DROP });
  }

  get showsFingerprint(): boolean {
    return this.fingerprintPrimary;
  }

  showFingerprint(state: FingerprintState, primary: boolean): void {
    if (primary !== this.fingerprintPrimary) {
      this.fingerprintPrimary = primary;
      this.reveal(primary ? this.fingerprintRow : this.passwordColumn, primary ? this.passwordColumn : this.fingerprintRow);
    }
    this.glyph.present(state);
    const text = describeFingerprint(state) ?? '';
    if (text !== this.fingerprintText) {
      this.fingerprintText = text;
      if (text) this.get_accessible().emit('notification', text, Atk.Live.POLITE);
    }
    if (primary) swapText(this.hint, text);
    this.hint.set_style_class_name(state.kind === 'retry' || state.kind === 'no-match' ? 'kestrel-auth-hint warning' : 'kestrel-auth-hint');

    const listening = state.kind !== 'idle' && state.kind !== 'unavailable';
    this.useFingerprint.visible = !primary && (listening || state.kind === 'unavailable');
    this.useFingerprint.label = KestrelUi.t(state.kind === 'unavailable' ? 'auth-prompt-try-fingerprint' : 'auth-prompt-use-fingerprint');
    if (state.kind === 'unavailable') this.setMessage(text);
  }

  setMessage(text: string | null, warning = false): void {
    this.message.remove_all_transitions();
    this.message.text = text ?? '';
    this.message.visible = !!text;
    this.message.opacity = 255;
    this.message.set_style_class_name(warning ? 'kestrel-auth-message warning' : 'kestrel-auth-message');
    if (text) this.get_accessible().emit('notification', text, Atk.Live.ASSERTIVE);
  }

  fadeMessage(): void {
    if (!this.message.visible) return;
    this.message.ease({ opacity: 0, duration: Duration.standard, curve: Curve.decelerate, onStopped: finished => finished && this.message.hide() });
  }

  private reveal(shown: St.Widget, hidden: St.Widget): void {
    shown.show();
    shown.reactive = true;
    hidden.reactive = false;
    shown.ease({ opacity: 255, duration: Duration.standard, curve: Curve.decelerate });
    shown.ease({ translation_y: 0, spring: Spring.snappy });
    hidden.ease({ translation_y: HIDDEN_DROP, spring: Spring.snappy });
    hidden.ease({
      opacity: 0, duration: hidden === this.fingerprintRow ? Duration.quick : Duration.standard, curve: Curve.decelerate,
      onStopped: finished => finished && hidden.hide(),
    });
  }
}
