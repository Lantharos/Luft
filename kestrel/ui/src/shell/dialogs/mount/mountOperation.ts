import Gio from 'gi://Gio';
import Shell from 'gi://Shell';

import { MountPasswordDialog } from './passwordDialog.js';
import { MountQuestionDialog } from './choiceDialogs.js';

export class ShellMountOperation {
  readonly mountOp = new Shell.MountOperation();
  private dialog: MountQuestionDialog | MountPasswordDialog | null = null;
  private drive: Gio.Drive | null;

  constructor(volume: Gio.Volume, private existingDialog: MountPasswordDialog | null = null) {
    this.mountOp.connect('ask-question', (_op, message, choices) => this.onAskQuestion(message, choices));
    this.mountOp.connect('ask-password', (_op, message, _defaultUser, _defaultDomain, flags) => this.onAskPassword(message, flags));
    this.mountOp.connect('aborted', () => this.close());

    this.drive = volume.get_drive();
    this.drive?.connectObject('disconnected', () => this.close(), this);
  }

  private closeExistingDialog(): void {
    this.existingDialog?.close();
    this.existingDialog = null;
  }

  private onAskQuestion(message: string, choices: string[]): void {
    this.closeExistingDialog();
    const dialog = new MountQuestionDialog();
    this.dialog = dialog;

    dialog.connectObject('response', (_dialog: MountQuestionDialog, choice: number) => {
      this.mountOp.set_choice(choice);
      this.mountOp.reply(Gio.MountOperationResult.HANDLED);

      this.close();
    }, this);

    dialog.update(message, choices);
    dialog.open();
  }

  private onAskPassword(message: string, flags: Gio.AskPasswordFlags): void {
    let dialog: MountPasswordDialog;
    if (this.existingDialog) {
      dialog = this.existingDialog;
      dialog.reaskPassword();
    } else {
      dialog = new MountPasswordDialog(message, flags);
    }
    this.dialog = dialog;

    dialog.connectObject('response',
      (_dialog: MountPasswordDialog, choice: number, password: string, remember: boolean, hiddenVolume: boolean, systemVolume: boolean, pim: number) => {
        if (choice === -1) {
          this.mountOp.reply(Gio.MountOperationResult.ABORTED);
          return;
        }

        this.mountOp.set_password_save(remember ? Gio.PasswordSave.PERMANENTLY : Gio.PasswordSave.NEVER);
        this.mountOp.set_password(password);
        this.mountOp.set_is_tcrypt_hidden_volume(hiddenVolume);
        this.mountOp.set_is_tcrypt_system_volume(systemVolume);
        this.mountOp.set_pim(pim);
        this.mountOp.reply(Gio.MountOperationResult.HANDLED);
      }, this);
    dialog.open();
  }

  close(): void {
    this.closeExistingDialog();

    this.dialog?.close();
    this.dialog = null;

    this.drive?.disconnectObject(this);
    this.drive = null;
  }

  borrowPasswordDialog(): MountPasswordDialog | null {
    this.dialog?.disconnectObject(this);
    return this.dialog instanceof MountPasswordDialog ? this.dialog : null;
  }
}
