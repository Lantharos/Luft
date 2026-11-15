import AccountsService from 'gi://AccountsService';
import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Polkit from 'gi://Polkit';
import St from 'gi://St';

import * as KestrelUi from '../../kestrelUi.js';
import { appIcon } from '../../appearance/icons/appIcons.js';
import { identifyProcess, verifiedApp } from '../../shared/apps/identity.js';
import { MessageDialogContent } from '../../shared/dialogs/dialog.js';
import { ModalDialog, State } from '../../shared/dialogs/modalDialog.js';
import type { FingerprintState } from '../prompt/fingerprintState.js';
import { Administrators } from './administrators.js';
import { Conversations } from './conversations.js';
import { PolkitMethods } from './methods.js';

const APP_ICON_SIZE = 44;
const DEFAULT_ICON = 'security-high-symbolic';
const PASSWORD_QUESTIONS = ['Password:', 'Password: '];
const ROOT = 0;

export interface Request {
  actionId: string;
  message: string;
  iconName: string;
  cookie: string;
  uids: number[];
  details: Record<string, string>;
}

type Choice = 'fingerprint' | 'password' | null;

const ME = new Gio.Credentials().get_unix_user();

function administrators(uids: number[]): number[] {
  const people = uids.filter(uid => uid !== ROOT);
  return people.length ? people : [ROOT];
}

function header({ message, iconName, details }: Request): MessageDialogContent {
  const identity = identifyProcess(Number(details['polkit.subject-pid'] ?? 0));
  const { name, app } = identity ? verifiedApp(identity) : { name: null, app: null };
  const content = new MessageDialogContent({
    title: app ? KestrelUi.t('polkit-allow-app-title', { app: name! }) : KestrelUi.t('polkit-allow-title'),
    description: message,
  });
  if (app) content.insert_child_at_index(appIcon(app, APP_ICON_SIZE, { style_class: 'kestrel-dialog-app-icon', x_align: Clutter.ActorAlign.START }), 0);
  else content.iconName = iconName || DEFAULT_ICON;
  return content;
}

function questionHint(question: string): string {
  return PASSWORD_QUESTIONS.includes(question) ? KestrelUi.t('auth-prompt-password') : question.replace(/[:：] *$/, '').trim();
}

export namespace AuthenticationDialog {
  export interface Signals extends ModalDialog.Signals {
    'done': (dismissed: boolean) => void;
  }
}

export class AuthenticationDialog extends ModalDialog {
  static [GObject.signals] = {
    'done': { param_types: [GObject.TYPE_BOOLEAN] },
  };

  static {
    GObject.registerClass(this);
  }

  declare connect: GObject.SignalMethods<this, AuthenticationDialog.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, AuthenticationDialog.Signals>['emit'];

  private readonly conversations: Conversations;
  private readonly methods = new PolkitMethods();
  private readonly allowButton: St.Button;
  private user: AccountsService.User | null = null;
  private uid = ROOT;
  private choice: Choice = null;
  private confirming = false;
  private askedPassword = false;
  private finished = false;
  private announced = false;
  private holdId = 0;

  constructor(private readonly request: Request) {
    super({ styleClass: 'prompt-dialog polkit-dialog', prompt: true });
    this.conversations = new Conversations(request.cookie);

    const content = header(request);
    const form = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-dialog-form' });
    content.add_child(form);
    this.contentLayout.add_child(content);

    const choices = administrators(request.uids);
    const chosen = request.uids.includes(ME) ? ME : choices[0];
    if (chosen !== ME) {
      const people = new Administrators(choices, chosen);
      people.connect('chosen', (_people, uid) => this.select(uid));
      form.add_child(people);
    }
    form.add_child(this.methods);

    this.addButton({ label: KestrelUi.t('polkit-cancel'), action: () => this.cancel(), key: Clutter.KEY_Escape });
    this.allowButton = this.addButton({ label: KestrelUi.t('polkit-allow'), action: () => this.allow(), reactive: false });
    this.allowButton.add_style_class_name('suggested-action');
    this.allowButton.bind_property('reactive', this.allowButton, 'can-focus', GObject.BindingFlags.SYNC_CREATE);

    this.methods.entry.clutter_text.connect('text-changed', () => this.syncAllow());
    this.methods.connect('submit', () => this.allow());
    this.methods.connect('use-password', (_methods, typed) => this.usePassword(typed));
    this.methods.connect('use-fingerprint', () => this.useFingerprint());

    this.conversations.connectObject(
      'fingerprint', (_conversations: Conversations, state: FingerprintState) => this.onFingerprint(state),
      'question', (_conversations: Conversations, text: string, echoOn: boolean) => this.onQuestion(text, echoOn),
      'message', (_conversations: Conversations, text: string, isError: boolean) => this.onMessage(text, isError),
      'failed', () => this.onFailed(),
      'succeeded', () => this.onSucceeded(),
      this);

    this.connect('closed', () => this.release());
    this.connect('notify::state', () => {
      if (this.announced || this.state !== State.OPENING) return;
      this.announced = true;
      KestrelUi.playSound('notification-low');
    });

    this.select(chosen);
  }

  cancel(): void {
    this.finish(true);
  }

  override close(): void {
    if (this.state === State.CLOSED) this.release();
    super.close();
  }

  private select(uid: number): void {
    this.uid = uid;
    this.user?.disconnectObject(this);
    this.user = AccountsService.UserManager.get_default().get_user_by_id(uid);
    this.confirming = false;
    this.choice = null;
    this.methods.entry.text = '';
    this.methods.setMessage(null, false);
    this.user.connectObject('notify::is-loaded', () => this.begin(), this);
    if (this.user.is_loaded) this.begin();
  }

  private begin(): void {
    this.user!.disconnectObject(this);
    if (this.user!.get_password_mode() === AccountsService.UserPasswordMode.NONE) {
      this.confirming = true;
      this.methods.hide();
      this.syncAllow();
      this.appear();
      return;
    }
    this.conversations.begin(Polkit.UnixUser.new(this.uid));
  }

  private appear(): void {
    if (this.open()) return;
    log(`polkitAuthenticationAgent: Failed to show modal dialog. Dismissing authentication request for action-id ${this.request.actionId} cookie ${this.request.cookie}`);
    this.finish(true);
  }

  private focusMethod(): void {
    const target = this.methods.focusTarget;
    this.setInitialKeyFocus(target);
    if (this.state === State.OPENED || this.state === State.OPENING) target.grab_key_focus();
  }

  private onFingerprint(state: FingerprintState): void {
    const listening = state.kind !== 'idle' && state.kind !== 'unavailable';
    const wasShown = this.methods.showsFingerprint;
    if (state.kind === 'unavailable' && this.choice === 'fingerprint') this.choice = null;
    this.methods.present(state, listening && this.choice !== 'password');
    if (state.kind === 'idle') return;
    this.methods.show();
    if (wasShown !== this.methods.showsFingerprint) this.focusMethod();
    this.appear();
  }

  private onQuestion(text: string, echoOn: boolean): void {
    this.askedPassword = PASSWORD_QUESTIONS.includes(text);
    this.methods.setQuestion(questionHint(text), echoOn);
    this.methods.entry.reactive = true;
    this.methods.show();
    this.syncAllow();
    if (!this.methods.showsFingerprint) this.focusMethod();
    this.appear();
  }

  private onMessage(text: string, isError: boolean): void {
    this.methods.setMessage(text, isError);
    this.appear();
  }

  private onFailed(): void {
    this.methods.entry.text = '';
    this.methods.entry.reactive = true;
    this.methods.reject(KestrelUi.t(this.askedPassword ? 'auth-prompt-wrong-password' : 'polkit-failed'));
    KestrelUi.playSound('error');
    this.syncAllow();
  }

  private onSucceeded(): void {
    const remaining = this.methods.matchRemaining;
    if (!remaining) {
      this.finish(false);
      return;
    }
    this.reactive = false;
    this.holdId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, remaining, () => {
      this.holdId = 0;
      this.finish(false);
      return GLib.SOURCE_REMOVE;
    });
  }

  private usePassword(typed: string): void {
    this.choice = 'password';
    this.conversations.usePassword();
    this.methods.present(this.conversations.fingerprint, false);
    const { entry } = this.methods;
    if (typed) entry.clutter_text.insert_text(typed, entry.clutter_text.cursor_position);
    this.focusMethod();
  }

  private useFingerprint(): void {
    this.choice = 'fingerprint';
    this.methods.entry.text = '';
    this.methods.setMessage(null, false);
    if (this.conversations.fingerprint.kind === 'unavailable') this.conversations.tryFingerprint();
    else this.onFingerprint(this.conversations.fingerprint);
  }

  private allow(): void {
    if (this.confirming) {
      this.confirming = false;
      this.conversations.begin(Polkit.UnixUser.new(this.uid));
      return;
    }
    const { entry } = this.methods;
    if (!entry.text || !entry.reactive || this.methods.showsFingerprint) return;
    const response = entry.text;
    entry.text = '';
    entry.reactive = false;
    this.methods.setMessage(null, false);
    this.syncAllow();
    this.conversations.answer(response);
  }

  private syncAllow(): void {
    this.allowButton.reactive = this.confirming || (!this.methods.showsFingerprint && this.methods.entry.reactive && this.methods.entry.text !== '');
  }

  private finish(dismissed: boolean): void {
    if (this.finished) return;
    this.finished = true;
    this.emit('done', dismissed);
  }

  private release(): void {
    if (this.holdId) GLib.source_remove(this.holdId);
    this.holdId = 0;
    this.user?.disconnectObject(this);
    this.conversations.disconnectObject(this);
    this.conversations.cancel();
    this.methods.entry.text = '';
  }
}
