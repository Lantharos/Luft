import Clutter from 'gi://Clutter';
import Shell from 'gi://Shell';
import St from 'gi://St';
import { CheckBox } from 'resource:///com/lantharos/kestrel/ui/checkBox.js';
import { MessageDialogContent } from 'resource:///com/lantharos/kestrel/ui/dialog.js';
import type { ModalDialog } from 'resource:///com/lantharos/kestrel/ui/modalDialog.js';

import { appIcon } from '../../appearance/icons/appIcons.js';
import { PasswordForm, feedbackLabel, showText, type PasswordEvents, type ShellEntryModule } from './passwordForm.js';
import type { Measure } from './quality.js';
import type { AccessRequest, PasswordRequest } from './request.js';

export type Prompt = { kind: 'access'; request: AccessRequest } | { kind: 'password'; request: PasswordRequest };

interface DialogEvents extends PasswordEvents {
  allowed(remember: boolean): void;
  alternative(): void;
  closed(): void;
}

const ICON_SIZE = 44;

export interface DialogModules {
  ModalDialog: typeof ModalDialog;
  shellEntry: ShellEntryModule;
}

let modules: Promise<DialogModules> | null = null;

export function loadDialogModules(): Promise<DialogModules> {
  modules ??= Promise.all([
    import('resource:///com/lantharos/kestrel/ui/modalDialog.js'),
    import('resource:///com/lantharos/kestrel/ui/shellEntry.js'),
  ]).then(([{ ModalDialog }, shellEntry]) => ({ ModalDialog, shellEntry }));
  return modules;
}

export class KeyringDialog {
  readonly kind: Prompt['kind'];
  private readonly header: MessageDialogContent;
  private readonly form = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-dialog-form' });
  private readonly hint = feedbackLabel('prompt-dialog-info-label');
  private appIcon: St.Icon | null = null;
  private remember: CheckBox | null = null;
  private password: PasswordForm | null = null;

  private constructor(private readonly modal: ModalDialog, prompt: Prompt, shellEntry: ShellEntryModule, private readonly events: DialogEvents, measure?: Measure) {
    this.kind = prompt.kind;
    this.header = new MessageDialogContent({ title: prompt.request.title });
    this.header.add_child(this.form);
    modal.contentLayout.add_child(this.header);
    modal.connect('closed', () => events.closed());
    if (prompt.kind === 'access') {
      this.buildAccess(prompt.request);
      this.describe(prompt.request);
    } else {
      this.password = new PasswordForm(this.form, this.hint, modal, shellEntry, events);
      if (prompt.request.remember) this.remember = this.addRemember('Save in your keyring', false);
      this.retry(prompt.request, measure);
    }
  }

  static open({ ModalDialog, shellEntry }: DialogModules, prompt: Prompt, events: DialogEvents, measure?: Measure): KeyringDialog | null {
    const modal = new ModalDialog({ styleClass: 'prompt-dialog kestrel-keyring-dialog' });
    const dialog = new KeyringDialog(modal, prompt, shellEntry, events, measure);
    if (modal.open()) return dialog;
    modal.destroy();
    return null;
  }

  get remembered(): boolean {
    return this.remember?.checked ?? false;
  }

  retry(request: PasswordRequest, measure?: Measure): void {
    this.describe(request);
    this.password!.apply(request, measure);
  }

  close(): void {
    this.modal.close();
  }

  private describe(request: AccessRequest | PasswordRequest): void {
    this.header.title = request.title;
    this.header.description = request.body;
    this.appIcon?.destroy();
    const app = request.app ? Shell.AppSystem.get_default().lookup_app(`${request.app}.desktop`) : null;
    this.appIcon = app ? appIcon(app, ICON_SIZE, { style_class: 'kestrel-keyring-app-icon', x_align: Clutter.ActorAlign.START }) : null;
    this.header.iconName = this.appIcon ? '' : request.icon;
    if (this.appIcon) this.header.insert_child_at_index(this.appIcon, 0);
  }

  private buildAccess(request: AccessRequest): void {
    showText(this.hint, request.fingerprint ? 'Touch the fingerprint reader to allow' : '');
    this.form.add_child(this.hint);
    if (request.remember) this.remember = this.addRemember('Remember for this app', true);
    this.form.visible = request.fingerprint || request.remember;
    if (request.alternative)
      this.modal.addButton({ label: request.alternative, action: () => this.events.alternative() });
    if (!request.single)
      this.modal.addButton({ label: request.deny, action: () => this.events.denied(), key: Clutter.KEY_Escape });
    if (!request.fingerprint)
      this.modal.addButton({ label: request.allow, action: () => this.events.allowed(this.remembered), default: true, key: request.single ? Clutter.KEY_Escape : undefined });
  }

  private addRemember(label: string, checked: boolean): CheckBox {
    const remember = new CheckBox(label);
    remember.checked = checked;
    this.form.add_child(remember);
    return remember;
  }
}
