import type AccountsService from 'gi://AccountsService';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import St from 'gi://St';

import * as KestrelUi from '../../kestrelUi.js';
import { Avatar } from '../../shared/widgets/userWidget.js';
import type { Authentication } from './authentication.js';
import type { FingerprintState } from './fingerprintState.js';
import { MethodArea, type Way } from './methodArea.js';
import { StatusRing } from './statusRing.js';

const PASSWORD_QUESTIONS = ['Password:', 'Password: '];
const QUESTIONS: Record<string, string> = {
  'Security key PIN: ': 'auth-prompt-key-pin',
  'Smart card PIN: ': 'auth-prompt-card-pin',
  'Recovery key: ': 'auth-prompt-recovery-key',
};
const MESSAGES: Record<string, string> = {
  'Plug in your security key': 'auth-prompt-plug-in-key',
  'Touch your security key': 'auth-prompt-touch-key',
  'Insert your smart card': 'auth-prompt-insert-card',
  'Password sign-in is back on': 'auth-prompt-password-back',
  'Password sign-in is turned off': 'auth-prompt-password-off',
  'Wrong PIN': 'auth-prompt-wrong-pin',
  'The PIN is blocked': 'auth-prompt-pin-blocked',
  'This isn\'t set up for this account': 'auth-prompt-not-enrolled',
  'That isn\'t this computer\'s recovery key': 'auth-prompt-wrong-recovery-key',
};
const FIELD_HINTS: Partial<Record<Way, string>> = {
  'security-key': 'auth-prompt-key-pin',
  'smart-card': 'auth-prompt-card-pin',
  'recovery-key': 'auth-prompt-recovery-key',
};
const SUCCESS_FILL = 260;
const SUCCESS_HOLD = 320;
const RETRY_FILL = 420;
const AVATAR_SIZE = 76;

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
  'use-way': (way: string) => void;
}

function questionHint(question: string): string {
  if (PASSWORD_QUESTIONS.includes(question)) return KestrelUi.t('auth-prompt-password');
  if (question in QUESTIONS) return KestrelUi.t(QUESTIONS[question]);
  return question.replace(/[:：] *$/, '').trim();
}

const messageText = (text: string) => (text in MESSAGES ? KestrelUi.t(MESSAGES[text]) : text);

function displayName(user: AccountsService.User | null): string {
  if (!user?.is_loaded) return '';
  return user.get_real_name() || user.get_user_name();
}

export const AuthPrompt = GObject.registerClass({
  Signals: {
    'cancelled': {},
    'succeeded': {},
    'user-name': { param_types: [GObject.TYPE_STRING] },
    'loading': { param_types: [GObject.TYPE_BOOLEAN] },
    'use-way': { param_types: [GObject.TYPE_STRING] },
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
  private successId = 0;
  private told: string | null = null;
  private way: Way = 'password';
  private ways: Way[] = ['password'];
  private user: AccountsService.User | null = null;
  private readonly avatarWell = new St.Bin({ style_class: 'kestrel-auth-avatar-well' });
  private readonly ring = new StatusRing(this.avatarWell);
  private readonly nameLabel = new St.Label({ name: 'kestrel-auth-name', style_class: 'kestrel-auth-name', x_align: Clutter.ActorAlign.START });
  private readonly method = new MethodArea();

  constructor(private readonly authentication: PromptAuthentication) {
    super({
      name: 'kestrel-auth',
      style_class: 'kestrel-auth',
      orientation: Clutter.Orientation.VERTICAL,
      x_align: Clutter.ActorAlign.START,
      reactive: true,
    });

    this.authentication.connectObject(
      'question', (_: Authentication, text: string, secret: boolean) => this.onQuestion(text, secret),
      'message', (_: Authentication, text: string, isError: boolean) => this.onMessage(text, isError),
      'failed', (_: Authentication, authError: boolean, description: string) => this.onFailed(authError, description),
      'succeeded', () => this.succeed(),
      this);

    this.add_child(this.ring);
    this.add_child(this.nameLabel);
    this.add_child(this.method);

    const { field } = this.method;
    field.connect('submit', () => this.submit());
    field.connect('back', () => this.cancel());
    field.connect('changed', () => {
      if (field.text) this.method.fadeMessage();
    });
    this.method.connect('use-way', (_method, way: string) => (way === 'password' ? this.usePassword('') : this.emit('use-way', way)));

    this.setBusy(false);
    this.updateBackButton();
    this.connect('destroy', () => {
      if (this.successId) GLib.source_remove(this.successId);
      field.clear();
    });
  }

  on_key_press_event(event: Clutter.Event): boolean {
    if (event.get_key_symbol() === Clutter.KEY_Escape) {
      this.cancel();
      return Clutter.EVENT_STOP;
    }
    const character = event.get_key_unicode();
    if (this.method.showsFingerprint && this.ways.includes('password') && character && GLib.unichar_isgraph(character)) {
      this.usePassword(character);
      return Clutter.EVENT_STOP;
    }
    return Clutter.EVENT_PROPAGATE;
  }

  get typed(): boolean {
    return this.method.field.text !== '';
  }

  get userName(): string | null {
    return this.activeUserName;
  }

  allowGoingBack(allowed: boolean): void {
    this.canGoBack = allowed;
    this.updateBackButton();
  }

  setUser(user: AccountsService.User | null): void {
    this.user?.disconnectObject(this);
    this.user = user;
    const avatar = new Avatar(user, { styleClass: 'kestrel-auth-avatar', iconSize: AVATAR_SIZE });
    this.avatarWell.child = avatar;
    const update = () => {
      avatar.update();
      this.nameLabel.text = displayName(user);
    };
    user?.connectObject('notify::is-loaded', update, 'changed', update, this);
    update();
  }

  askForUserName(): void {
    this.authentication.cancel();
    this.activeUserName = null;
    this.askingUserName = true;
    this.question = null;
    this.preemptiveAnswer = null;
    this.method.field.useEntry(false, KestrelUi.t('auth-prompt-username'));
    this.updateBackButton();
    this.setBusy(false);
    this.method.setMessage(null);
  }

  /**
   * The ways the person may sign in and the one this attempt uses, so the
   * prompt opens on it without showing another first.
   */
  setWays(ways: Way[], way: Way): void {
    this.ways = ways;
    this.way = way;
    this.method.setWays(ways, way);
    if (!this.question) this.useFieldFor(way);
  }

  private useFieldFor(way: Way): void {
    const hint = FIELD_HINTS[way];
    this.method.field.useEntry(way !== 'recovery-key', hint ? KestrelUi.t(hint) : '');
  }

  begin(userName: string): void {
    this.activeUserName = userName;
    this.askingUserName = false;
    this.question = null;
    this.answered = false;
    this.stalled = false;
    this.retrying = false;
    this.told = null;
    this.method.setMessage(null);
    this.method.field.clear();
    this.useFieldFor(this.way);
    this.updateBackButton();
    this.authentication.begin(userName);
  }

  cancel(): void {
    this.authentication.cancel();
    this.question = null;
    this.preemptiveAnswer = null;
    this.method.field.clear();
    this.setBusy(false);
    this.method.setMessage(null);
    this.emit('cancelled');
  }

  focus(typed = ''): void {
    if (typed && this.ways.includes('password')) this.usePassword(typed);
    else if (this.method.showsFingerprint) (this.method.firstSwitch ?? this).grab_key_focus();
    else this.method.field.entry.grab_key_focus();
  }

  setFingerprint(state: FingerprintState, primary: boolean, instant = false): void {
    if (primary && !this.method.showsFingerprint && this.method.field.text !== '' && this.way === 'password') {
      this.emit('use-way', 'password');
      return;
    }
    const focus = global.stage.key_focus;
    const focused = focus !== null && this.contains(focus);
    this.method.showFingerprint(state, primary, instant);
    this.showFingerprintOnRing(state);
    if (focused) this.focus();
  }

  succeed(): void {
    if (this.successId) return;
    this.question = null;
    this.reactive = false;
    this.ring.fill(1, SUCCESS_FILL);
    this.successId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, SUCCESS_HOLD, () => {
      this.successId = 0;
      this.emit('succeeded');
      return GLib.SOURCE_REMOVE;
    });
  }

  private showFingerprintOnRing(state: FingerprintState): void {
    if (this.method.field.waiting) return;
    switch (state.kind) {
    case 'retry':
      this.ring.fill(0.36, RETRY_FILL);
      break;
    case 'no-match':
      this.ring.fail();
      break;
    case 'match':
      break;
    default:
      this.ring.clear();
    }
  }

  private usePassword(typed: string): void {
    if (this.method.showsFingerprint || this.way !== 'password') this.emit('use-way', 'password');
    const { field } = this.method;
    if (typed && !field.waiting) field.insert(typed);
    this.focus();
  }

  private updateBackButton(): void {
    this.method.field.canGoBack = this.canGoBack || (this.question?.step ?? 0) > 1;
  }

  private submit(): void {
    const { field } = this.method;
    if (field.waiting) return;

    const text = field.text;
    if (this.askingUserName) {
      if (text.trim()) this.emit('user-name', text.trim());
      return;
    }
    if (!text && this.question?.secret) return;

    this.setBusy(true);
    this.answered = true;
    if (this.question) {
      this.authentication.answer(text);
    } else {
      this.preemptiveAnswer = text;
      if (this.stalled) this.restart();
    }
    field.clear();
  }

  private onMessage(text: string, isError: boolean): void {
    const shown = messageText(text);
    if (isError && text in MESSAGES) this.told = shown;
    if (!this.retrying || isError) this.method.setMessage(shown, isError);
  }

  private onQuestion(text: string, secret: boolean): void {
    this.retrying = false;
    this.told = null;
    this.question = { text, secret, step: (this.question?.step ?? 0) + 1 };
    this.updateBackButton();

    if (this.preemptiveAnswer !== null && secret) {
      const answer = this.preemptiveAnswer;
      this.preemptiveAnswer = null;
      this.authentication.answer(answer);
      return;
    }

    this.method.field.useEntry(secret, questionHint(text));
    this.setBusy(false);
  }

  private onFailed(authError: boolean, description: string): void {
    if (!authError) console.warn(`Authentication did not complete: ${description}`);
    const password = this.question?.secret && PASSWORD_QUESTIONS.includes(this.question.text);
    this.method.setMessage(this.told ?? KestrelUi.t(password ? 'auth-prompt-wrong-password' : 'auth-prompt-failed'), true);
    this.told = null;
    this.ring.fail();
    this.method.field.shake();
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
    this.method.field.waiting = busy;
    if (busy) {
      this.ring.sweep();
    } else {
      if (!this.successId) this.ring.clear();
      this.focus();
    }
    this.emit('loading', busy);
  }
});
export type AuthPrompt = InstanceType<typeof AuthPrompt>;
