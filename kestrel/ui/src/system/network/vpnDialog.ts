import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import type Shell from 'gi://Shell';
import St from 'gi://St';
import { EntryField, MessageDialogContent } from 'resource:///com/lantharos/kestrel/ui/dialog.js';
import type { ModalDialog } from 'resource:///com/lantharos/kestrel/ui/modalDialog.js';

import { feedbackLabel, showText } from '../../auth/keyring/passwordForm.js';
import type { DialogModules } from '../../auth/keyring/dialog.js';

export interface Choice {
  name: string;
  label: string;
}

export interface Field {
  key: string;
  label: string;
  value: string;
  secret: boolean;
  choices?: Choice[];
}

export interface Step {
  message: string;
  warning?: string;
  fields: Field[];
  action?: string;
}

export interface VpnDialogEvents {
  submit(values: Record<string, string>): void;
  cancel(): void;
}

type Value = () => string;

interface Control {
  value: Value;
  entry: St.Entry | null;
  actor: St.Widget;
}

const ICON = 'network-vpn-symbolic';
const MANY_CHOICES = 3;


function choiceRow(field: Field, changed: () => void): [St.BoxLayout, Value] {
  const many = field.choices!.length > MANY_CHOICES;
  const row = new St.BoxLayout({ style_class: 'kestrel-choices', orientation: many ? Clutter.Orientation.VERTICAL : Clutter.Orientation.HORIZONTAL });
  let chosen = field.value || field.choices![0]?.name || '';
  const buttons = field.choices!.map(choice => {
    const button = new St.Button({ style_class: 'kestrel-choice kestrel-control', label: choice.label, toggle_mode: true, can_focus: true, x_expand: many });
    button.checked = choice.name === chosen;
    button.connect('clicked', () => {
      chosen = choice.name;
      for (const other of buttons) other.checked = other === button;
      changed();
    });
    row.add_child(button);
    return button;
  });
  return [row, () => chosen];
}

export class VpnDialog {
  private readonly content: MessageDialogContent;
  private readonly form = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-dialog-form' });
  private readonly warning = feedbackLabel('prompt-dialog-error-label');
  private controls = new Map<string, Control>();
  private shape = '';
  private submitButton: St.Button | null = null;
  private busy = false;
  private finished = false;

  private constructor(private readonly modal: ModalDialog, private readonly modules: DialogModules, title: string, private readonly events: VpnDialogEvents) {
    this.content = new MessageDialogContent({ title, icon_name: ICON });
    this.form.add_child(this.warning);
    this.content.add_child(this.form);
    modal.contentLayout.add_child(this.content);
    modal.connect('closed', () => {
      if (!this.finished) this.cancel();
    });
  }

  static open(modules: DialogModules, title: string, events: VpnDialogEvents): VpnDialog {
    return new VpnDialog(new modules.ModalDialog({ styleClass: 'prompt-dialog kestrel-vpn-dialog' }), modules, title, events);
  }

  show(step: Step): boolean {
    this.busy = false;
    this.content.description = step.message;
    const shape = step.fields.map(({ key, secret, choices }) => `${key} ${secret} ${choices?.map(choice => choice.name)}`).join('\n');
    if (shape === this.shape) this.refill(step.fields);
    else this.build(step.fields);
    this.shape = shape;
    showText(this.warning, step.warning ?? '');
    this.form.visible = this.controls.size > 0 || !!step.warning;
    this.setEditable(true);
    this.modal.clearButtons();
    this.modal.addButton({ label: 'Cancel', action: () => this.cancel(), key: Clutter.KEY_Escape });
    this.submitButton = this.modal.addButton({ label: step.action ?? 'Connect', action: () => this.submit(), default: true });
    this.sync();
    if (!this.modal.open()) return false;
    const empty = [...this.controls.values()].find(control => control.entry && !control.entry.text);
    (empty?.entry ?? this.submitButton).grab_key_focus();
    return true;
  }

  wait(message: string): void {
    this.busy = true;
    this.content.description = message;
    this.setEditable(false);
    this.modal.clearButtons();
    this.modal.addButton({ label: 'Cancel', action: () => this.cancel(), key: Clutter.KEY_Escape });
    this.submitButton = null;
  }

  close(): void {
    this.finished = true;
    this.modal.close();
  }

  private build(fields: Field[]): void {
    (global as unknown as Shell.Global).stage.set_key_focus(null);
    this.form.remove_child(this.warning);
    this.form.destroy_all_children();
    this.controls = new Map(fields.map(field => [field.key, this.control(field)]));
    for (const { actor } of this.controls.values()) this.form.add_child(actor);
    if (fields.some(field => field.secret)) this.form.add_child(new this.modules.shellEntry.CapsLockWarning());
    this.form.add_child(this.warning);
  }

  private refill(fields: Field[]): void {
    for (const field of fields) {
      const entry = this.controls.get(field.key)?.entry;
      if (entry) entry.text = field.secret ? '' : field.value;
    }
  }

  private control(field: Field): Control {
    if (field.choices?.length) {
      const [actor, value] = choiceRow(field, () => this.sync());
      return { actor, value, entry: null };
    }
    const params = { style_class: 'prompt-dialog-password-entry', text: field.value, can_focus: true, x_expand: true };
    const entry = field.secret ? new St.PasswordEntry(params) : new St.Entry(params);
    this.modules.shellEntry.addContextMenu(entry);
    entry.bind_property('reactive', entry.clutter_text, 'editable', GObject.BindingFlags.SYNC_CREATE);
    entry.clutter_text.connect('text-changed', () => this.sync());
    entry.clutter_text.connect('activate', () => this.submit());
    return { actor: new EntryField(entry, field.label), value: () => entry.text, entry };
  }

  private setEditable(editable: boolean): void {
    for (const { actor, entry } of this.controls.values()) {
      for (const target of entry ? [entry] : actor.get_children()) target.reactive = editable;
    }
  }

  private get complete(): boolean {
    return [...this.controls.values()].every(control => control.value() !== '');
  }

  private sync(): void {
    if (!this.submitButton) return;
    this.submitButton.reactive = this.complete;
    this.submitButton.can_focus = this.complete;
  }

  private submit(): void {
    if (this.busy || !this.complete) return;
    this.busy = true;
    this.events.submit(Object.fromEntries([...this.controls].map(([key, control]) => [key, control.value()])));
  }

  private cancel(): void {
    if (this.finished) return;
    this.close();
    this.events.cancel();
  }
}
