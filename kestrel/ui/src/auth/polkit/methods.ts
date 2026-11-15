import Atk from 'gi://Atk';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Pango from 'gi://Pango';
import St from 'gi://St';

import * as KestrelUi from '../../kestrelUi.js';
import { Curve, Duration, Spring } from '../../shared/motion/motion.js';
import * as ShellEntry from '../../shared/widgets/shellEntry.js';
import { shake } from '../../shared/motion/shake.js';
import { FingerprintGlyph, matchShown } from '../prompt/fingerprintGlyph.js';
import { describeFingerprint, type FingerprintState } from '../prompt/fingerprintState.js';

const HIDDEN_DROP = 6;

export namespace PolkitMethods {
  export interface Signals extends St.Widget.SignalSignatures {
    'use-password': (typed: string) => void;
    'use-fingerprint': () => void;
    'submit': () => void;
  }
}

function quiet(name: string, x_align: Clutter.ActorAlign): St.Button {
  return new St.Button({ name, style_class: 'kestrel-auth-quiet', can_focus: true, x_align });
}

function wrapping(styleClass: string, x_align: Clutter.ActorAlign): St.Label {
  const label = new St.Label({ style_class: styleClass, x_align });
  label.clutter_text.line_wrap = true;
  label.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
  return label;
}

const listening = (state: FingerprintState) => state.kind !== 'idle' && state.kind !== 'unavailable';

export class PolkitMethods extends St.Widget {
  static [GObject.signals] = {
    'use-password': { param_types: [GObject.TYPE_STRING] },
    'use-fingerprint': {},
    'submit': {},
  };

  static {
    GObject.registerClass(this);
  }

  declare connect: GObject.SignalMethods<this, PolkitMethods.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, PolkitMethods.Signals>['emit'];

  readonly entry = new St.PasswordEntry({ style_class: 'prompt-dialog-password-entry', can_focus: true, x_expand: true });
  private readonly glyph = new FingerprintGlyph();
  private readonly hint = wrapping('kestrel-auth-hint', Clutter.ActorAlign.CENTER);
  private readonly usePassword = quiet('kestrel-auth-use-password', Clutter.ActorAlign.CENTER);
  private readonly useFingerprint = quiet('kestrel-auth-use-fingerprint', Clutter.ActorAlign.START);
  private readonly message = wrapping('polkit-dialog-message', Clutter.ActorAlign.START);
  private readonly fingerprintPane = new St.BoxLayout({ style_class: 'polkit-dialog-fingerprint', orientation: Clutter.Orientation.VERTICAL, x_expand: true });
  private readonly passwordPane = new St.BoxLayout({ style_class: 'polkit-dialog-password', orientation: Clutter.Orientation.VERTICAL, x_expand: true });
  private fingerprintShown = false;
  private announced = '';
  private matchedAt = 0;

  constructor() {
    super({ style_class: 'polkit-dialog-methods', layout_manager: new Clutter.BinLayout(), x_expand: true });

    this.glyph.x_align = Clutter.ActorAlign.CENTER;
    this.hint.clutter_text.set({ line_alignment: Pango.Alignment.CENTER });
    for (const actor of [this.glyph, this.hint, this.usePassword]) this.fingerprintPane.add_child(actor);
    KestrelUi.localized(this.usePassword, () => (this.usePassword.label = KestrelUi.t('auth-prompt-use-password')));
    this.usePassword.connect('clicked', () => this.emit('use-password', ''));
    this.fingerprintPane.connect('key-press-event', (_actor, event: Clutter.Event) => this.typedIntoFingerprint(event));

    ShellEntry.addContextMenu(this.entry);
    this.entry.bind_property('reactive', this.entry.clutter_text, 'editable', GObject.BindingFlags.SYNC_CREATE);
    this.entry.clutter_text.connect('activate', () => this.emit('submit'));
    this.entry.clutter_text.connect('text-changed', () => this.fadeMessage());
    const feedback = new St.BoxLayout({ style_class: 'polkit-dialog-feedback', orientation: Clutter.Orientation.VERTICAL });
    feedback.add_child(new ShellEntry.CapsLockWarning({ style_class: 'caps-lock-warning-label polkit-dialog-message' }));
    feedback.add_child(this.message);
    this.message.hide();
    for (const actor of [this.entry, feedback, this.useFingerprint]) this.passwordPane.add_child(actor);
    this.useFingerprint.connect('clicked', () => this.emit('use-fingerprint'));

    for (const pane of [this.fingerprintPane, this.passwordPane]) this.add_child(pane);
    this.fingerprintPane.set({ opacity: 0, visible: false, translation_y: HIDDEN_DROP });
    this.useFingerprint.hide();
    this.setQuestion(KestrelUi.t('auth-prompt-password'), false);
  }

  get showsFingerprint(): boolean {
    return this.fingerprintShown;
  }

  get focusTarget(): St.Widget {
    return this.fingerprintShown ? this.usePassword : this.entry;
  }

  present(state: FingerprintState, primary: boolean): void {
    if (primary !== this.fingerprintShown) {
      this.fingerprintShown = primary;
      this.reveal(primary ? this.fingerprintPane : this.passwordPane, primary ? this.passwordPane : this.fingerprintPane);
    }
    if (state.kind !== 'idle') this.add_style_class_name('with-fingerprint');
    if (state.kind === 'match' && primary) this.matchedAt = GLib.get_monotonic_time() / 1000;
    this.glyph.present(state);
    const text = describeFingerprint(state) ?? '';
    if (primary) this.swapHint(text);
    this.hint.set_style_class_name(state.kind === 'retry' || state.kind === 'no-match' ? 'kestrel-auth-hint warning' : 'kestrel-auth-hint');
    if (text !== this.announced) {
      this.announced = text;
      if (text) this.get_accessible().emit('notification', text, Atk.Live.POLITE);
    }

    const offered = !primary && (listening(state) || state.kind === 'unavailable');
    this.useFingerprint.visible = offered;
    this.useFingerprint.label = KestrelUi.t(state.kind === 'unavailable' ? 'auth-prompt-try-fingerprint' : 'auth-prompt-use-fingerprint');
    if (state.kind === 'unavailable' && !primary) this.setMessage(text, false);
  }

  get matchRemaining(): number {
    if (!this.matchedAt) return 0;
    return Math.max(0, this.matchedAt + matchShown() - GLib.get_monotonic_time() / 1000);
  }

  setQuestion(hint: string, echoOn: boolean): void {
    this.entry.hint_text = hint;
    this.entry.accessible_name = hint;
    this.entry.password_visible = echoOn;
    this.entry.show_peek_icon = !echoOn;
  }

  setMessage(text: string | null, warning: boolean): void {
    this.message.remove_all_transitions();
    this.message.set({ text: text ?? '', visible: !!text, opacity: 255 });
    this.message.set_style_class_name(warning ? 'polkit-dialog-message warning' : 'polkit-dialog-message');
    if (text) this.get_accessible().emit('notification', text, Atk.Live.ASSERTIVE);
  }

  reject(text: string): void {
    this.setMessage(text, true);
    shake(this.entry);
  }

  private fadeMessage(): void {
    if (!this.message.visible || !this.entry.text) return;
    this.message.ease({ opacity: 0, duration: Duration.standard, curve: Curve.decelerate, onStopped: finished => finished && this.message.hide() });
  }

  private typedIntoFingerprint(event: Clutter.Event): boolean {
    const character = event.get_key_unicode();
    if (!character || !GLib.unichar_isgraph(character)) return Clutter.EVENT_PROPAGATE;
    this.emit('use-password', character);
    return Clutter.EVENT_STOP;
  }

  private swapHint(value: string): void {
    if (this.hint.text === value) return;
    this.hint.ease({
      opacity: 0, duration: Duration.tap, curve: Curve.decelerate,
      onStopped: () => {
        this.hint.text = value;
        this.hint.ease({ opacity: 255, duration: Duration.quick, curve: Curve.decelerate });
      },
    });
  }

  private reveal(shown: St.Widget, hidden: St.Widget): void {
    shown.show();
    shown.reactive = true;
    hidden.reactive = false;
    shown.ease({ opacity: 255, duration: Duration.standard, curve: Curve.decelerate });
    shown.ease({ translation_y: 0, spring: Spring.snappy });
    hidden.ease({ translation_y: HIDDEN_DROP, spring: Spring.snappy });
    hidden.ease({
      opacity: 0, duration: hidden === this.fingerprintPane ? Duration.quick : Duration.standard, curve: Curve.decelerate,
      onStopped: finished => finished && hidden.hide(),
    });
  }
}
