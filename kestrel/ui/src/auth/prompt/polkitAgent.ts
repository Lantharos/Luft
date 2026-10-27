import AccountsService from 'gi://AccountsService';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Pango from 'gi://Pango';
import PolkitAgent from 'gi://PolkitAgent';
import Polkit from 'gi://Polkit';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as Dialog from '../../shared/dialogs/dialog.js';
import * as KestrelUi from '../../kestrelUi.js';
import * as Main from '../../core/main.js';
import * as ShellEntry from '../../shared/widgets/shellEntry.js';
import * as UserWidget from '../../shared/widgets/userWidget.js';
import { ModalDialog, State } from '../../shared/dialogs/modalDialog.js';
import { wiggle } from '../../core/runtime/animationUtils.js';

const DialogMode = {
  AUTH: 0,
  CONFIRM: 1,
} as const;
type DialogMode = typeof DialogMode[keyof typeof DialogMode];

const DIALOG_ICON_SIZE = 36;
const DELAYED_RESET_TIMEOUT = 200;

function wrappingLabel(styleClass: string): St.Label {
  const label = new St.Label({ style_class: styleClass, visible: false });
  label.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
  label.clutter_text.line_wrap = true;
  return label;
}

function authenticatingUser(userNames: string[]): string {
  if (userNames.length > 1)
    log(`polkitAuthenticationAgent: Received ${userNames.length} identities that can be used for authentication. Only considering one.`);

  const userName = GLib.get_user_name();
  if (userNames.includes(userName)) return userName;
  if (userNames.includes('root')) return 'root';
  return userNames[0];
}

namespace AuthenticationDialog {
  export interface Signals extends ModalDialog.Signals {
    'done': (dismissed: boolean) => void;
  }
}

class AuthenticationDialog extends ModalDialog {
  static [GObject.signals] = {
    'done': { param_types: [GObject.TYPE_BOOLEAN] },
  };

  static {
    GObject.registerClass(this);
  }

  declare connect: GObject.SignalMethods<this, AuthenticationDialog.Signals>['connect'];
  declare connect_after: GObject.SignalMethods<this, AuthenticationDialog.Signals>['connect_after'];
  declare emit: GObject.SignalMethods<this, AuthenticationDialog.Signals>['emit'];

  private readonly user: AccountsService.User;
  private readonly identityToAuth: Polkit.Identity;
  private readonly userAvatar: UserWidget.Avatar;
  private readonly userLabel: St.Label;
  private readonly passwordEntry: St.PasswordEntry;
  private readonly passwordField: Dialog.EntryField;
  private readonly errorMessageLabel = wrappingLabel('prompt-dialog-error-label');
  private readonly infoMessageLabel = wrappingLabel('prompt-dialog-info-label');
  private readonly cancelButton: St.Button;
  private readonly okButton: St.Button;
  private session: PolkitAgent.Session | null = null;
  private mode: DialogMode | -1 = -1;
  private doneEmitted = false;
  private completed = false;
  private announced = false;
  private sessionRequestTimeoutId = 0;

  constructor(private readonly actionId: string, description: string, private readonly cookie: string, userNames: string[]) {
    super({ styleClass: 'prompt-dialog polkit-dialog' });

    Main.sessionMode.connectObject('updated', () => {
      this.visible = !Main.sessionMode.isLocked;
    }, this);

    this.connect('closed', () => this.onDialogClosed());

    this.contentLayout.add_child(new Dialog.MessageDialogContent({
      title: KestrelUi.t('polkit-title'),
      description,
      iconName: 'security-high-symbolic',
    }));

    const bodyContent = new St.BoxLayout({
      orientation: Clutter.Orientation.VERTICAL,
      style_class: 'kestrel-dialog-form',
    });

    const userName = authenticatingUser(userNames);
    this.user = AccountsService.UserManager.get_default().get_user(userName);

    const userBox = new St.BoxLayout({ style_class: 'polkit-dialog-user-layout' });
    bodyContent.add_child(userBox);

    this.userAvatar = new UserWidget.Avatar(this.user, { iconSize: DIALOG_ICON_SIZE });
    this.userAvatar.y_align = Clutter.ActorAlign.CENTER;
    userBox.add_child(this.userAvatar);

    const isRoot = userName === 'root';
    this.userLabel = new St.Label({
      text: isRoot ? KestrelUi.t('polkit-administrator') : userName,
      y_align: Clutter.ActorAlign.CENTER,
      x_expand: true,
      style_class: isRoot ? 'polkit-dialog-user-root-label' : 'polkit-dialog-user-label',
    });
    userBox.add_child(this.userLabel);

    const passwordBox = new St.BoxLayout({
      style_class: 'prompt-dialog-password-layout',
      orientation: Clutter.Orientation.VERTICAL,
    });

    this.passwordEntry = new St.PasswordEntry({
      style_class: 'prompt-dialog-password-entry',
      text: '',
      can_focus: true,
      visible: false,
      x_expand: true,
    });
    ShellEntry.addContextMenu(this.passwordEntry);
    this.passwordEntry.clutter_text.connect('activate', () => this.onEntryActivate());
    this.passwordEntry.bind_property('reactive', this.passwordEntry.clutter_text, 'editable', GObject.BindingFlags.SYNC_CREATE);
    this.passwordField = new Dialog.EntryField(this.passwordEntry, KestrelUi.t('polkit-password'));
    passwordBox.add_child(this.passwordField);

    const warningBox = new St.BoxLayout({
      orientation: Clutter.Orientation.VERTICAL,
      style_class: 'kestrel-auth-feedback',
    });

    const capsLockWarning = new ShellEntry.CapsLockWarning();
    this.passwordEntry.bind_property('visible', capsLockWarning, 'visible', GObject.BindingFlags.SYNC_CREATE);
    warningBox.add_child(capsLockWarning);
    warningBox.add_child(this.errorMessageLabel);
    warningBox.add_child(this.infoMessageLabel);

    passwordBox.add_child(warningBox);
    bodyContent.add_child(passwordBox);

    this.cancelButton = this.addButton({
      label: KestrelUi.t('polkit-cancel'),
      action: () => this.cancel(),
      key: Clutter.KEY_Escape,
    });
    this.okButton = this.addButton({
      label: KestrelUi.t('polkit-authenticate'),
      action: () => this.onAuthenticateButtonPressed(),
      reactive: false,
    });
    this.okButton.add_style_class_name('suggested-action');
    this.okButton.bind_property('reactive', this.okButton, 'can-focus', GObject.BindingFlags.SYNC_CREATE);

    this.passwordEntry.clutter_text.connect('text-changed', text => {
      this.okButton.reactive = text.get_text().length > 0;
    });

    this.contentLayout.add_child(bodyContent);

    this.identityToAuth = Polkit.UnixUser.new_for_name(userName)!;

    this.user.connectObject(
      'notify::is-loaded', () => this.onUserChanged(),
      'changed', () => this.onUserChanged(), this);
    this.onUserChanged();
  }

  private initiateSession(): void {
    this.destroySession(DELAYED_RESET_TIMEOUT);

    this.session = new PolkitAgent.Session({
      identity: this.identityToAuth,
      cookie: this.cookie,
    });
    this.session.connectObject(
      'completed', (_session: PolkitAgent.Session, gainedAuthorization: boolean) => this.onSessionCompleted(gainedAuthorization),
      'request', (_session: PolkitAgent.Session, request: string, echoOn: boolean) => this.onSessionRequest(request, echoOn),
      'show-error', (_session: PolkitAgent.Session, text: string) => this.onSessionShowError(text),
      'show-info', (_session: PolkitAgent.Session, text: string) => this.onSessionShowInfo(text), this);
    this.session.initiate();
  }

  private ensureOpen(): void {
    if (!this.open()) {
      log(`polkitAuthenticationAgent: Failed to show modal dialog. Dismissing authentication request for action-id ${this.actionId} cookie ${this.cookie}`);
      this.emitDone(true);
    } else if (!this.announced) {
      this.announced = true;
      KestrelUi.playSound('notification-low');
    }
  }

  private emitDone(dismissed: boolean): void {
    if (this.doneEmitted) return;
    this.doneEmitted = true;
    this.emit('done', dismissed);
  }

  private onEntryActivate(): void {
    const response = this.passwordEntry.get_text();
    if (response.length === 0) return;

    this.passwordEntry.reactive = false;
    this.okButton.reactive = false;

    this.session!.response(response);
    this.errorMessageLabel.hide();
    this.infoMessageLabel.hide();
  }

  private onAuthenticateButtonPressed(): void {
    if (this.mode === DialogMode.CONFIRM) this.initiateSession();
    else this.onEntryActivate();
  }

  private onSessionCompleted(gainedAuthorization: boolean): void {
    if (this.completed || this.doneEmitted) return;

    this.completed = true;

    if (gainedAuthorization) {
      this.emitDone(false);
      return;
    }

    if (!this.errorMessageLabel.visible) {
      this.errorMessageLabel.set_text(KestrelUi.t('polkit-failed'));
      this.errorMessageLabel.show();
      this.infoMessageLabel.hide();

      void wiggle(this.passwordEntry);
    }

    this.initiateSession();
  }

  private onSessionRequest(request: string, echoOn: boolean): void {
    if (this.sessionRequestTimeoutId) {
      GLib.source_remove(this.sessionRequestTimeoutId);
      this.sessionRequestTimeoutId = 0;
    }

    this.passwordField.label = request === 'Password:' || request === 'Password: '
      ? KestrelUi.t('polkit-password')
      : request.replace(/: *$/, '').trim();

    this.passwordEntry.password_visible = echoOn;

    this.passwordEntry.show();
    this.passwordEntry.set_text('');
    this.passwordEntry.reactive = true;
    this.okButton.reactive = false;

    this.ensureOpen();
    this.passwordEntry.grab_key_focus();
  }

  private onSessionShowError(text: string): void {
    this.passwordEntry.set_text('');
    this.errorMessageLabel.set_text(text);
    this.errorMessageLabel.show();
    this.infoMessageLabel.hide();
    this.ensureOpen();
  }

  private onSessionShowInfo(text: string): void {
    this.passwordEntry.set_text('');
    this.infoMessageLabel.set_text(text);
    this.infoMessageLabel.show();
    this.errorMessageLabel.hide();
    this.ensureOpen();
  }

  private destroySession(delay = 0): void {
    this.session?.disconnectObject(this);

    if (!this.completed) this.session?.cancel();

    this.completed = false;
    this.session = null;

    if (this.sessionRequestTimeoutId) {
      GLib.source_remove(this.sessionRequestTimeoutId);
      this.sessionRequestTimeoutId = 0;
    }

    const resetDialog = () => {
      this.sessionRequestTimeoutId = 0;

      if (this.state !== State.OPENED) return;

      this.passwordEntry.hide();
      this.cancelButton.grab_key_focus();
      this.okButton.reactive = false;
    };

    if (delay) {
      this.sessionRequestTimeoutId = GLib.timeout_add_once(GLib.PRIORITY_DEFAULT, delay, resetDialog);
      GLib.Source.set_name_by_id(this.sessionRequestTimeoutId, '[kestrel] this._sessionRequestTimeoutId');
    } else {
      resetDialog();
    }
  }

  private onUserChanged(): void {
    if (!this.user.is_loaded) return;

    const userName = this.user.get_user_name();
    if (userName !== 'root') this.userLabel.set_text(this.user.get_real_name() || userName);

    this.userAvatar.update();

    if (this.user.get_password_mode() === AccountsService.UserPasswordMode.NONE) {
      if (this.mode === DialogMode.CONFIRM) return;

      this.mode = DialogMode.CONFIRM;
      this.destroySession();

      this.okButton.reactive = true;
      this.ensureOpen();
    } else {
      if (this.mode === DialogMode.AUTH) return;

      this.mode = DialogMode.AUTH;
      this.initiateSession();
    }
  }

  override close(): void {
    if (this.state === State.CLOSED) this.onDialogClosed();
    super.close();
  }

  cancel(): void {
    this.emitDone(true);
  }

  private onDialogClosed(): void {
    Main.sessionMode.disconnectObject(this);

    if (this.sessionRequestTimeoutId) GLib.source_remove(this.sessionRequestTimeoutId);
    this.sessionRequestTimeoutId = 0;

    this.user.disconnectObject(this);

    this.destroySession();
  }
}

class AuthenticationAgent extends Shell.PolkitAuthenticationAgent {
  static {
    GObject.registerClass(this);
  }

  private currentDialog: AuthenticationDialog | null = null;

  constructor() {
    super();
    this.connect('initiate', (_agent, actionId, message, _iconName, cookie, userNames) => this.onInitiate(actionId, message, cookie, userNames));
    this.connect('cancel', () => this.completeRequest(false));
  }

  enable(): void {
    try {
      this.register();
    } catch {
      log('Failed to register AuthenticationAgent');
    }
  }

  disable(): void {
    try {
      this.unregister();
    } catch {
      log('Failed to unregister AuthenticationAgent');
    }
  }

  private onInitiate(actionId: string, message: string, cookie: string, userNames: string[]): void {
    if (Main.sessionMode.isLocked) {
      Main.sessionMode.connectObject('updated', () => {
        Main.sessionMode.disconnectObject(this);
        this.onInitiate(actionId, message, cookie, userNames);
      }, this);
      return;
    }

    this.currentDialog = new AuthenticationDialog(actionId, message, cookie, userNames);
    this.currentDialog.connect('done', (_dialog, dismissed) => this.completeRequest(dismissed));
  }

  private completeRequest(dismissed: boolean): void {
    this.currentDialog!.close();
    this.currentDialog = null;

    Main.sessionMode.disconnectObject(this);

    this.complete(dismissed);
  }
}

export { AuthenticationAgent as Component };
