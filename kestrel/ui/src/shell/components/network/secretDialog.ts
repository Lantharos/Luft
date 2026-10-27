import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import NM from 'gi://NM';
import Pango from 'gi://Pango';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as Dialog from '../../dialogs/dialog.js';
import * as KestrelUi from '../../../kestrelUi.js';
import * as ShellEntry from '../../widgets/shellEntry.js';
import { ModalDialog, type ButtonInfo } from '../../dialogs/modalDialog.js';
import { secretContent, type Secret } from './secrets.js';

interface SecretField {
  secret: Secret;
  valid: boolean;
}

function isValid({ value, validate }: Secret): boolean {
  return validate ? validate(value) : value.length > 0;
}

export class NetworkSecretDialog extends ModalDialog {
  static {
    GObject.registerClass(this);
  }

  private readonly fields: SecretField[] = [];
  private readonly okButton: ButtonInfo;

  constructor(private readonly agent: Shell.NetworkAgent, private readonly requestId: string, connection: NM.Connection,
    settingName: string, hints: string[], flags: NM.SecretAgentGetSecretsFlags) {
    super({ styleClass: 'prompt-dialog' });

    const rejected = !!(flags & NM.SecretAgentGetSecretsFlags.REQUEST_NEW);
    const content = secretContent(connection, settingName, hints, rejected);

    const contentBox = new Dialog.MessageDialogContent({
      title: content.title,
      description: content.message,
      iconName: content.iconName,
    });

    let initialFocusSet = false;
    for (const secret of content.secrets) {
      const reactive = secret.key != null;
      const entryParams = {
        style_class: 'prompt-dialog-password-entry',
        text: secret.value,
        can_focus: reactive,
        reactive,
        x_expand: true,
      };
      const entry = secret.password ? new St.PasswordEntry(entryParams) : new St.Entry(entryParams);
      ShellEntry.addContextMenu(entry);
      contentBox.add_child(new Dialog.EntryField(entry, secret.label));

      const field = { secret, valid: !reactive || isValid(secret) };
      this.fields.push(field);

      if (!reactive) continue;

      if (!initialFocusSet) {
        this.setInitialKeyFocus(entry);
        initialFocusSet = true;
      }

      entry.clutter_text.connect('activate', () => this.onOk());
      entry.clutter_text.connect('text-changed', () => {
        secret.value = entry.get_text();
        field.valid = isValid(secret);
        this.updateOkButton();
      });
    }

    if (content.secrets.some(secret => secret.password)) contentBox.add_child(new ShellEntry.CapsLockWarning());

    if (flags & NM.SecretAgentGetSecretsFlags.WPS_PBC_ACTIVE) {
      const descriptionLabel = new St.Label({
        text: KestrelUi.t('network-agent-wps-hint'),
        style_class: 'message-dialog-description',
      });
      descriptionLabel.clutter_text.line_wrap = true;
      descriptionLabel.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
      contentBox.add_child(descriptionLabel);
    }

    this.contentLayout.add_child(contentBox);

    this.okButton = {
      label: KestrelUi.t('network-agent-connect'),
      action: () => this.onOk(),
      default: true,
    };

    this.setButtons([{
      label: KestrelUi.t('network-agent-cancel'),
      action: () => this.cancel(),
      key: Clutter.KEY_Escape,
    }, this.okButton]);

    this.updateOkButton();
  }

  private get valid(): boolean {
    return this.fields.every(field => field.valid);
  }

  private updateOkButton(): void {
    const { valid } = this;
    this.okButton.button!.reactive = valid;
    this.okButton.button!.can_focus = valid;
  }

  private onOk(): void {
    for (const { secret } of this.fields) {
      if (secret.key !== null) this.agent.set_password(this.requestId, secret.key, secret.value);
    }

    if (!this.valid) return;

    this.agent.respond(this.requestId, Shell.NetworkAgentResponse.CONFIRMED);
    this.close();
  }

  cancel(): void {
    this.agent.respond(this.requestId, Shell.NetworkAgentResponse.USER_CANCELED);
    this.close();
  }
}
