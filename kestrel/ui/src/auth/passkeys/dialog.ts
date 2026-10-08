import Clutter from 'gi://Clutter';
import St from 'gi://St';

import type { ModalDialog } from 'resource:///com/lantharos/kestrel/ui/modalDialog.js';
import { choose, list, row } from '../../portal/core/rows.js';
import { copyFor, needsVerification, type Request } from './copy.js';

interface Answers {
  account(index: number): void;
  password(text: string): void;
  confirm(): void;
  cancel(): void;
}

export class PasskeyDialog {
  private modal: ModalDialog | null = null;
  private passwordEntry: St.PasswordEntry | null = null;
  private fingerprintBox: St.BoxLayout | null = null;
  private passwordBox: St.BoxLayout | null = null;
  private status: St.Label | null = null;
  private fingerprintLabel: St.Label | null = null;
  private continueButton: St.Button | null = null;
  private closed = false;

  constructor(private readonly request: Request, private readonly answers: Answers) {}

  async open(): Promise<boolean> {
    const [{ MessageDialogContent }, { ModalDialog }] = await Promise.all([
      import('resource:///com/lantharos/kestrel/ui/dialog.js'),
      import('resource:///com/lantharos/kestrel/ui/modalDialog.js'),
    ]);
    const copy = copyFor(this.request);
    const modal = new ModalDialog({ styleClass: 'kestrel-portal-dialog kestrel-passkey-dialog' });
    this.modal = modal;
    modal.contentLayout.add_child(new MessageDialogContent({ title: copy.title, description: copy.description, icon_name: copy.icon }));
    const content = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-portal-content', x_expand: true });
    modal.contentLayout.add_child(content);
    this.addAccounts(content);
    if (needsVerification(this.request.purpose)) this.addVerification(content);
    else this.addConfirmation();
    modal.connect('closed', () => {
      if (!this.closed) this.answers.cancel();
      this.closed = true;
    });
    if (modal.open()) return true;
    modal.destroy();
    return false;
  }

  private addAccounts(content: St.BoxLayout): void {
    const { accounts, purpose } = this.request;
    if (!accounts.length || purpose === 'registered') return;
    const rows = accounts.map(({ name, displayName }) => row({
      icon: 'avatar-default-symbolic',
      title: displayName || name,
      subtitle: displayName && name !== displayName ? name : undefined,
      checked: accounts.length > 1 ? false : undefined,
    }));
    if (rows.length > 1) {
      rows[0].checked = true;
      choose(rows, index => this.answers.account(index));
    } else {
      rows[0].reactive = rows[0].can_focus = false;
    }
    content.add_child(list(rows, rows.length > 4));
  }

  private addVerification(content: St.BoxLayout): void {
    const fingerprintBox = new St.BoxLayout({ style_class: 'kestrel-passkey-fingerprint', x_expand: true });
    fingerprintBox.add_child(new St.Icon({ icon_name: 'auth-fingerprint-symbolic', style_class: 'kestrel-passkey-fingerprint-icon', y_align: Clutter.ActorAlign.CENTER }));
    this.fingerprintLabel = new St.Label({ text: this.request.fingerprint ?? '', style_class: 'kestrel-passkey-fingerprint-label', x_expand: true, y_align: Clutter.ActorAlign.CENTER });
    this.fingerprintLabel.clutter_text.line_wrap = true;
    fingerprintBox.add_child(this.fingerprintLabel);
    const usePassword = new St.Button({ label: 'Use password', style_class: 'kestrel-portal-link', can_focus: true, y_align: Clutter.ActorAlign.CENTER });
    usePassword.connect('clicked', () => this.showPassword());
    fingerprintBox.add_child(usePassword);
    this.fingerprintBox = fingerprintBox;
    content.add_child(fingerprintBox);

    const passwordBox = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-portal-field', x_expand: true, visible: false });
    const entry = new St.PasswordEntry({ style_class: 'prompt-dialog-password-entry kestrel-passkey-password', hint_text: 'Password', can_focus: true, x_expand: true });
    entry.clutter_text.connect('activate', () => this.submit());
    entry.clutter_text.connect('text-changed', () => this.syncContinue());
    passwordBox.add_child(entry);
    this.passwordEntry = entry;
    this.passwordBox = passwordBox;
    content.add_child(passwordBox);

    this.status = new St.Label({ style_class: 'kestrel-passkey-status', visible: false, x_expand: true });
    this.status.clutter_text.line_wrap = true;
    content.add_child(this.status);

    const modal = this.modal!;
    modal.addButton({ label: 'Cancel', action: () => this.cancel(), key: Clutter.KEY_Escape });
    this.continueButton = modal.addButton({ label: 'Continue', action: () => this.submit(), default: true, reactive: false });
    this.continueButton.visible = false;
    if (!this.request.fingerprint) this.showPassword();
  }

  private addConfirmation(): void {
    const modal = this.modal!;
    if (this.request.purpose === 'registered') {
      modal.addButton({ label: 'OK', action: () => this.confirm(), default: true, key: Clutter.KEY_Escape });
      return;
    }
    modal.addButton({ label: 'Cancel', action: () => this.cancel(), key: Clutter.KEY_Escape });
    modal.addButton({ label: 'Use this computer', action: () => this.confirm(), default: true });
  }

  private showPassword(): void {
    this.fingerprintBox?.hide();
    this.passwordBox?.show();
    if (this.continueButton) this.continueButton.visible = true;
    this.showStatus(null);
    if (this.passwordEntry) this.modal?.setInitialKeyFocus(this.passwordEntry);
    this.passwordEntry?.grab_key_focus();
  }

  private syncContinue(): void {
    if (!this.continueButton || !this.passwordEntry) return;
    this.continueButton.reactive = this.continueButton.can_focus = this.passwordEntry.text.length > 0 && this.passwordEntry.reactive;
  }

  private submit(): void {
    const entry = this.passwordEntry;
    if (!entry || !entry.text || !entry.reactive) return;
    const text = entry.text;
    entry.reactive = false;
    this.syncContinue();
    this.showStatus(null);
    this.answers.password(text);
  }

  private confirm(): void {
    this.closed = true;
    this.answers.confirm();
    this.modal?.close();
  }

  private cancel(): void {
    this.closed = true;
    this.answers.cancel();
    this.modal?.close();
  }

  private showStatus(message: string | null): void {
    if (!this.status) return;
    this.status.text = message ?? '';
    this.status.visible = message !== null;
  }

  fingerprintHint(message: string): void {
    if (this.fingerprintLabel) this.fingerprintLabel.text = message;
  }

  fingerprintUnavailable(): void {
    this.showPassword();
    this.showStatus('Use your password to continue.');
  }

  wrongPassword(): void {
    const entry = this.passwordEntry;
    if (!entry) return;
    entry.text = '';
    entry.reactive = true;
    entry.grab_key_focus();
    this.syncContinue();
    this.showStatus('That password isn’t right. Try again.');
  }

  close(): void {
    this.closed = true;
    this.modal?.close();
  }
}
