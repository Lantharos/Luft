import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Pango from 'gi://Pango';
import St from 'gi://St';
import { wiggle } from 'resource:///com/lantharos/kestrel/misc/animationUtils.js';
import { EntryField } from 'resource:///com/lantharos/kestrel/ui/dialog.js';
import type { ModalDialog } from 'resource:///com/lantharos/kestrel/ui/modalDialog.js';

import { QualityMeter, type Measure } from './quality.js';
import type { PasswordRequest } from './request.js';

export type ShellEntryModule = typeof import('resource:///com/lantharos/kestrel/ui/shellEntry.js');

export interface PasswordEvents {
  entered(secret: string): void;
  denied(): void;
}

export function feedbackLabel(styleClass: string): St.Label {
  const label = new St.Label({ style_class: styleClass, visible: false });
  label.clutter_text.line_wrap = true;
  label.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
  return label;
}

export function showText(label: St.Label, text: string): void {
  label.text = text;
  label.visible = !!text;
}

function passwordEntry(shellEntry: ShellEntryModule): St.PasswordEntry {
  const entry = new St.PasswordEntry({ style_class: 'prompt-dialog-password-entry', can_focus: true, x_expand: true });
  shellEntry.addContextMenu(entry);
  entry.bind_property('reactive', entry.clutter_text, 'editable', GObject.BindingFlags.SYNC_CREATE);
  return entry;
}

export class PasswordForm {
  private readonly entry: St.PasswordEntry;
  private readonly confirmEntry: St.PasswordEntry;
  private readonly field: EntryField;
  private readonly quality = new QualityMeter();
  private readonly warning = feedbackLabel('prompt-dialog-error-label');
  private readonly cancelButton: St.Button;
  private readonly submitButton: St.Button;
  private mismatch = '';
  private busy = false;

  constructor(form: St.BoxLayout, private readonly hint: St.Label, modal: ModalDialog, shellEntry: ShellEntryModule, private readonly events: PasswordEvents) {
    this.entry = passwordEntry(shellEntry);
    this.confirmEntry = passwordEntry(shellEntry);
    this.field = new EntryField(this.entry, '');
    form.add_child(this.field);
    form.add_child(this.quality.actor);
    form.add_child(new EntryField(this.confirmEntry, 'Confirm'));

    const feedback = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-auth-feedback' });
    feedback.add_child(new shellEntry.CapsLockWarning());
    feedback.add_child(this.warning);
    feedback.add_child(hint);
    form.add_child(feedback);

    for (const entry of [this.entry, this.confirmEntry])
      entry.clutter_text.connect('text-changed', () => this.syncSubmit());
    this.entry.clutter_text.connect('text-changed', () => this.quality.measure(this.entry.text));
    this.entry.clutter_text.connect('activate', () => {
      if (this.confirmEntry.visible) this.confirmEntry.grab_key_focus();
      else this.submit();
    });
    this.confirmEntry.clutter_text.connect('activate', () => this.submit());

    this.cancelButton = modal.addButton({ label: '', action: () => events.denied(), key: Clutter.KEY_Escape });
    this.submitButton = modal.addButton({ label: '', action: () => this.submit(), default: true });
    modal.setInitialKeyFocus(this.entry);
  }

  apply(request: PasswordRequest, measure?: Measure): void {
    this.field.label = request.label;
    const purpose = request.numeric ? Clutter.InputContentPurpose.DIGITS : Clutter.InputContentPurpose.PASSWORD;
    this.entry.input_purpose = purpose;
    this.confirmEntry.input_purpose = purpose;
    this.confirmEntry.visible = request.confirm;
    this.mismatch = request.mismatch;
    this.quality.use(request.quality ? measure : undefined);
    showText(this.hint, request.fingerprint ? 'Or touch the fingerprint reader' : '');
    this.cancelButton.label = request.cancel;
    this.submitButton.label = request.continue;
    this.warn(request.warning);
    this.setBusy(false);
    this.entry.grab_key_focus();
  }

  private submit(): void {
    if (this.busy || !this.entry.text) return;
    if (this.confirmEntry.visible && this.confirmEntry.text !== this.entry.text) {
      this.confirmEntry.text = '';
      this.warn(this.mismatch);
      this.confirmEntry.grab_key_focus();
      return;
    }
    const secret = this.entry.text;
    this.setBusy(true);
    this.entry.text = '';
    this.confirmEntry.text = '';
    this.events.entered(secret);
  }

  private warn(text: string): void {
    showText(this.warning, text);
    if (text && this.entry.mapped) wiggle(this.entry);
  }

  private setBusy(busy: boolean): void {
    this.busy = busy;
    this.entry.reactive = !busy;
    this.confirmEntry.reactive = !busy;
    this.syncSubmit();
  }

  private syncSubmit(): void {
    const ready = !this.busy && !!this.entry.text;
    this.submitButton.reactive = ready;
    this.submitButton.can_focus = ready;
  }
}
