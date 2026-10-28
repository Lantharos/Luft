import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as KestrelUi from '../../kestrelUi.js';
import { Curve, Duration, Spring } from '../../shared/motion/motion.js';
import * as ShellEntry from '../../shared/widgets/shellEntry.js';
import { shake } from '../../shared/motion/shake.js';

const HIDDEN_GO_SCALE = 0.7;
const WAITING_OPACITY = 140;

export namespace PasswordField {
  export interface Signals extends St.BoxLayout.SignalSignatures {
    'submit': () => void;
    'back': () => void;
    'changed': () => void;
  }
}

function tool(styleClass: string, iconName: string, key: string): St.Button {
  const button = new St.Button({ style_class: `kestrel-auth-tool ${styleClass}`, can_focus: true, y_align: Clutter.ActorAlign.CENTER, icon_name: iconName });
  button.set_pivot_point(0.5, 0.5);
  KestrelUi.localized(button, () => (button.accessible_name = KestrelUi.t(key)));
  return button;
}

export class PasswordField extends St.BoxLayout {
  static [GObject.signals] = {
    'submit': {},
    'back': {},
    'changed': {},
  };

  static {
    GObject.registerClass(this);
  }

  declare connect: GObject.SignalMethods<this, PasswordField.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, PasswordField.Signals>['emit'];

  private readonly back = tool('kestrel-auth-back', 'go-previous-symbolic', 'auth-prompt-back');
  private readonly textEntry: St.Entry;
  private readonly passwordEntry: St.PasswordEntry;
  private readonly reveal = tool('kestrel-auth-reveal', 'view-reveal-symbolic', 'auth-prompt-show-password');
  private readonly go = tool('kestrel-auth-go', 'go-next-symbolic', 'auth-prompt-submit');
  private goShown = true;
  entry: St.Entry;

  constructor() {
    super({ style_class: 'kestrel-auth-field', y_align: Clutter.ActorAlign.START });
    const entryParams = { style_class: 'kestrel-auth-entry', can_focus: true, x_expand: true, y_align: Clutter.ActorAlign.CENTER };
    this.textEntry = new St.Entry(entryParams);
    this.passwordEntry = new St.PasswordEntry({ ...entryParams, show_peek_icon: false });
    for (const entry of [this.textEntry, this.passwordEntry]) {
      ShellEntry.addContextMenu(entry, { actionMode: Shell.ActionMode.NONE });
      entry.clutter_text.connect('text-changed', () => this.textChanged());
      entry.clutter_text.connect('activate', () => this.emit('submit'));
      entry.clutter_text.connect('key-focus-in', () => this.add_style_pseudo_class('focus'));
      entry.clutter_text.connect('key-focus-out', () => this.remove_style_pseudo_class('focus'));
    }
    this.entry = this.passwordEntry;

    this.back.visible = false;
    this.back.connect('clicked', () => this.emit('back'));
    this.reveal.connect('clicked', () => this.toggleReveal());
    this.go.connect('clicked', () => this.emit('submit'));
    this.go.can_focus = false;
    for (const actor of [this.back, this.entry, this.reveal, this.go]) this.add_child(actor);
    this.showGo(false);
  }

  set canGoBack(allowed: boolean) {
    this.back.visible = allowed;
  }

  get text(): string {
    return this.entry.text;
  }

  set waiting(waiting: boolean) {
    this.entry.reactive = !waiting;
    this.go.reactive = !waiting;
    if (waiting) this.passwordEntry.password_visible = false;
    this.ease({ opacity: waiting ? WAITING_OPACITY : 255, duration: Duration.quick, curve: Curve.decelerate });
  }

  get waiting(): boolean {
    return !this.entry.reactive;
  }

  useEntry(secret: boolean, hint: string): void {
    const entry = secret ? this.passwordEntry : this.textEntry;
    if (entry !== this.entry) {
      const { text, cursorPosition, selectionBound } = this.entry.clutter_text;
      this.replace_child(this.entry, entry);
      this.entry.text = '';
      this.entry = entry;
      this.entry.clutter_text.set({ text, cursorPosition, selectionBound });
    }
    this.entry.hint_text = hint;
    this.reveal.visible = secret;
  }

  insert(text: string): void {
    this.entry.clutter_text.insert_text(text, this.entry.clutter_text.cursor_position);
  }

  clear(): void {
    this.textEntry.text = '';
    this.passwordEntry.text = '';
    this.passwordEntry.password_visible = false;
  }

  shake(): void {
    shake(this);
  }

  private toggleReveal(): void {
    this.passwordEntry.password_visible = !this.passwordEntry.password_visible;
    this.reveal.icon_name = this.passwordEntry.password_visible ? 'view-conceal-symbolic' : 'view-reveal-symbolic';
    this.entry.grab_key_focus();
  }

  private textChanged(): void {
    this.showGo(this.entry.text !== '');
    this.emit('changed');
  }

  private showGo(shown: boolean): void {
    if (shown === this.goShown) return;
    this.goShown = shown;
    if (shown) this.go.show();
    const scale = shown ? 1 : HIDDEN_GO_SCALE;
    this.go.ease({
      opacity: shown ? 255 : 0, scale_x: scale, scale_y: scale, spring: Spring.snappy,
      onStopped: finished => finished && !this.goShown && this.go.hide(),
    });
  }
}
