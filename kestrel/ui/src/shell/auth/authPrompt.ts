import type AccountsService from 'gi://AccountsService';
import Atk from 'gi://Atk';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Pango from 'gi://Pango';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as Animation from '../widgets/animation.js';
import * as KestrelUi from '../../kestrelUi.js';
import * as ShellEntry from '../widgets/shellEntry.js';
import * as UserWidget from '../widgets/userWidget.js';
import { wiggle } from '../runtime/animationUtils.js';
import type { Authentication } from './authentication.js';

const BUTTON_ICON_SIZE = 16;
const FADE_TIME = 300;
const PASSWORD_QUESTIONS = ['Password:', 'Password: '];

type PromptAuthentication = Pick<Authentication, 'begin' | 'answer' | 'cancel' | 'connectObject'>;

interface Question {
  text: string;
  secret: boolean;
  step: number;
}

interface AuthPromptSignals extends St.BoxLayout.SignalSignatures {
  'cancelled': () => void;
  'succeeded': () => void;
  'user-name': (name: string) => void;
  'loading': (busy: boolean) => void;
}

function questionHint(question: string): string {
  if (PASSWORD_QUESTIONS.includes(question)) return KestrelUi.t('auth-prompt-password');
  return question.replace(/[:：] *$/, '').trim();
}

export const AuthPrompt = GObject.registerClass({
  Signals: {
    'cancelled': {},
    'succeeded': {},
    'user-name': { param_types: [GObject.TYPE_STRING] },
    'loading': { param_types: [GObject.TYPE_BOOLEAN] },
  },
}, class AuthPrompt extends St.BoxLayout {
  declare connect: GObject.SignalMethods<this, AuthPromptSignals>['connect'];
  declare emit: GObject.SignalMethods<this, AuthPromptSignals>['emit'];

  private canGoBack = false;
  private activeUserName: string | null = null;
  private askingUserName = false;
  private question: Question | null = null;
  private preemptiveAnswer: string | null = null;
  private answered = false;
  private stalled = false;
  private retrying = false;
  private readonly userWell: St.Bin;
  private readonly backButton: St.Button;
  private readonly entryArea: St.Widget;
  private readonly textEntry: St.Entry;
  private readonly passwordEntry: St.PasswordEntry;
  private entry: St.Entry;
  private readonly nextButton: St.Button;
  private readonly spinner: InstanceType<typeof Animation.Spinner>;
  private readonly capsLockWarning: St.Label;
  private readonly message: St.Label;
  private readonly hint: St.Label;

  constructor(private readonly authentication: PromptAuthentication) {
    super({
      style_class: 'login-dialog-prompt-layout',
      orientation: Clutter.Orientation.VERTICAL,
      x_expand: true,
      x_align: Clutter.ActorAlign.CENTER,
      reactive: true,
    });

    this.authentication.connectObject(
      'question', (_: Authentication, text: string, secret: boolean) => this.onQuestion(text, secret),
      'message', (_: Authentication, text: string, isError: boolean) => this.onMessage(text, isError),
      'failed', (_: Authentication, authError: boolean, description: string) => this.onFailed(authError, description),
      'succeeded', () => this.succeed(),
      this);

    this.userWell = new St.Bin({ x_expand: true });
    this.add_child(this.userWell);

    const inputWell = new St.BoxLayout({
      style_class: 'login-dialog-input-well',
      orientation: Clutter.Orientation.VERTICAL,
    });
    this.add_child(inputWell);

    const row = new St.BoxLayout({ style_class: 'login-dialog-button-box' });
    inputWell.add_child(row);

    this.backButton = new St.Button({
      style_class: 'login-dialog-button cancel-button',
      can_focus: true,
      y_align: Clutter.ActorAlign.CENTER,
      icon_name: 'go-previous-symbolic',
    });
    KestrelUi.localized(this.backButton, () => (this.backButton.accessible_name = KestrelUi.t('auth-prompt-back')));
    this.backButton.connect('clicked', () => this.cancel());
    row.add_child(this.backButton);

    this.entryArea = new St.Widget({
      style_class: 'login-dialog-prompt-entry-area',
      layout_manager: new Clutter.BinLayout(),
      x_expand: true,
    });
    row.add_child(this.entryArea);

    row.add_child(new Clutter.Actor({
      constraints: new Clutter.BindConstraint({
        source: this.backButton,
        coordinate: Clutter.BindCoordinate.WIDTH,
      }),
    }));

    const entryParams = { style_class: 'login-dialog-prompt-entry', can_focus: true, x_expand: true };
    this.textEntry = new St.Entry(entryParams);
    this.passwordEntry = new St.PasswordEntry(entryParams);
    for (const entry of [this.textEntry, this.passwordEntry]) {
      ShellEntry.addContextMenu(entry, { actionMode: Shell.ActionMode.NONE });
      entry.clutter_text.connect('text-changed', () => this.fadeOutMessage());
      entry.clutter_text.connect('activate', () => this.submit());
    }
    this.entry = this.passwordEntry;
    this.entryArea.add_child(this.entry);

    const buttonWell = new St.Widget({
      layout_manager: new Clutter.BinLayout(),
      style_class: 'login-dialog-default-button-well',
      x_expand: true,
      x_align: Clutter.ActorAlign.END,
      y_align: Clutter.ActorAlign.CENTER,
    });
    this.entryArea.add_child(buttonWell);

    this.nextButton = new St.Button({
      style_class: 'login-dialog-button next-button',
      can_focus: false,
      icon_name: 'go-next-symbolic',
    });
    KestrelUi.localized(this.nextButton, () => (this.nextButton.accessible_name = KestrelUi.t('auth-prompt-submit')));
    this.nextButton.connect('clicked', () => this.submit());
    this.nextButton.add_style_pseudo_class('default');
    buttonWell.add_child(this.nextButton);

    this.spinner = new Animation.Spinner(BUTTON_ICON_SIZE);
    buttonWell.add_child(this.spinner);

    this.capsLockWarning = new ShellEntry.CapsLockWarning({
      x_expand: true,
      x_align: Clutter.ActorAlign.CENTER,
    });
    inputWell.add_child(this.capsLockWarning);

    this.message = new St.Label({
      style_class: 'login-dialog-message',
      opacity: 0,
      x_expand: true,
      x_align: Clutter.ActorAlign.CENTER,
    });
    this.message.clutter_text.line_wrap = true;
    this.message.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
    inputWell.add_child(this.message);

    this.hint = new St.Label({
      style_class: 'login-dialog-message login-dialog-hint',
      visible: false,
      x_expand: true,
      x_align: Clutter.ActorAlign.CENTER,
    });
    this.hint.clutter_text.line_wrap = true;
    this.hint.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
    inputWell.insert_child_above(this.hint, row);

    this.setBusy(false);
    this.updateBackButton();
    this.connect('destroy', () => this.clearEntries());
  }

  on_key_press_event(event: Clutter.Event): boolean {
    if (event.get_key_symbol() === Clutter.KEY_Escape) {
      this.cancel();
      return Clutter.EVENT_STOP;
    }
    return Clutter.EVENT_PROPAGATE;
  }

  get userName(): string | null {
    return this.activeUserName;
  }

  allowGoingBack(allowed: boolean): void {
    this.canGoBack = allowed;
    this.updateBackButton();
  }

  setUser(user: AccountsService.User | null): void {
    this.userWell.child?.destroy();
    this.userWell.child = new UserWidget.UserWidget(user, Clutter.Orientation.VERTICAL);
  }

  askForUserName(): void {
    this.authentication.cancel();
    this.activeUserName = null;
    this.askingUserName = true;
    this.question = null;
    this.preemptiveAnswer = null;
    this.useEntry(false, KestrelUi.t('auth-prompt-username'));
    this.updateBackButton();
    this.setBusy(false);
    this.setMessage(null);
  }

  begin(userName: string): void {
    this.activeUserName = userName;
    this.askingUserName = false;
    this.question = null;
    this.answered = false;
    this.stalled = false;
    this.retrying = false;
    this.clearEntries();
    this.useEntry(true, '');
    this.updateBackButton();
    this.authentication.begin(userName);
  }

  cancel(): void {
    this.authentication.cancel();
    this.question = null;
    this.preemptiveAnswer = null;
    this.clearEntries();
    this.setBusy(false);
    this.setMessage(null);
    this.emit('cancelled');
  }

  focus(): void {
    this.entry.grab_key_focus();
  }

  setHint(hint: string | null): void {
    this.hint.visible = !!hint;
    if (!hint) return;
    this.hint.text = hint;
    this.get_accessible().emit('notification', hint, Atk.Live.POLITE);
  }

  succeed(): void {
    this.question = null;
    this.stopSpinner();
    this.reactive = false;
    this.entryArea.ease({ opacity: 0, duration: FADE_TIME, mode: Clutter.AnimationMode.EASE_OUT_QUAD });
    this.emit('succeeded');
  }

  private updateBackButton(): void {
    const visible = this.canGoBack || (this.question?.step ?? 0) > 1;
    this.backButton.opacity = visible ? 255 : 0;
    this.backButton.reactive = visible;
    this.backButton.can_focus = visible;
  }

  private useEntry(secret: boolean, hint: string): void {
    const entry = secret ? this.passwordEntry : this.textEntry;
    if (entry !== this.entry) {
      const { text, cursorPosition, selectionBound } = this.entry.clutter_text;
      this.entryArea.replace_child(this.entry, entry);
      this.entry.text = '';
      this.entry = entry;
      this.entry.clutter_text.set({ text, cursorPosition, selectionBound });
    }
    this.entry.hint_text = hint;
    this.capsLockWarning.visible = secret;
  }

  private submit(): void {
    if (!this.entry.reactive) return;

    const text = this.entry.text;
    if (this.askingUserName) {
      if (text.trim()) this.emit('user-name', text.trim());
      return;
    }

    this.setBusy(true);
    this.answered = true;
    if (this.question) {
      this.authentication.answer(text);
    } else {
      this.preemptiveAnswer = text;
      if (this.stalled) this.restart();
    }
    this.clearEntries();
  }

  private onMessage(text: string, isError: boolean): void {
    if (!this.retrying) this.setMessage(text, isError);
  }

  private onQuestion(text: string, secret: boolean): void {
    this.retrying = false;
    this.question = { text, secret, step: (this.question?.step ?? 0) + 1 };
    this.updateBackButton();

    if (this.preemptiveAnswer !== null && secret) {
      const answer = this.preemptiveAnswer;
      this.preemptiveAnswer = null;
      this.authentication.answer(answer);
      return;
    }

    this.useEntry(secret, questionHint(text));
    this.setBusy(false);
  }

  private onFailed(authError: boolean, description: string): void {
    if (!authError) console.warn(`Authentication did not complete: ${description}`);
    const password = this.question?.secret && PASSWORD_QUESTIONS.includes(this.question.text);
    this.setMessage(KestrelUi.t(password ? 'auth-prompt-wrong-password' : 'auth-prompt-failed'), true);
    wiggle(this.entryArea);
    KestrelUi.playSound('error');
    this.question = null;
    this.preemptiveAnswer = null;
    this.setBusy(false);
    if (this.answered) this.restart();
    else this.stalled = true;
  }

  private restart(): void {
    this.answered = false;
    this.stalled = false;
    this.retrying = true;
    this.authentication.begin(this.activeUserName!);
  }

  private setBusy(busy: boolean): void {
    this.entry.reactive = !busy;
    this.nextButton.reactive = !busy;
    if (busy) {
      this.passwordEntry.password_visible = false;
      this.spinner.play();
    } else {
      this.stopSpinner();
      this.entry.grab_key_focus();
    }
    this.nextButton.opacity = busy ? 0 : 255;
    this.spinner.opacity = busy ? 255 : 0;
    this.emit('loading', busy);
  }

  private stopSpinner(): void {
    this.spinner.stop();
    this.spinner.opacity = 0;
  }

  private clearEntries(): void {
    this.textEntry.text = '';
    this.passwordEntry.text = '';
  }

  private fadeOutMessage(): void {
    if (this.message.opacity === 0 || this.entry.text === '') return;
    this.message.ease({ opacity: 0, duration: FADE_TIME, mode: Clutter.AnimationMode.EASE_OUT_QUAD });
  }

  private setMessage(message: string | null, isError = false): void {
    this.message.remove_all_transitions();
    if (!message) {
      this.message.opacity = 0;
      return;
    }
    if (isError) this.message.add_style_class_name('login-dialog-message-warning');
    else this.message.remove_style_class_name('login-dialog-message-warning');
    this.message.text = message;
    this.message.opacity = 255;
    this.get_accessible().emit('notification', message, Atk.Live.ASSERTIVE);
  }
});
export type AuthPrompt = InstanceType<typeof AuthPrompt>;
