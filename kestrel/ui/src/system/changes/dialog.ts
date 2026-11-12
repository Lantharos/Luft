import Clutter from 'gi://Clutter';
import Pango from 'gi://Pango';
import St from 'gi://St';

import { MessageDialogContent } from '../../shared/dialogs/dialog.js';
import { dialogScroll } from '../../shared/dialogs/dialogScroll.js';
import { ModalDialog } from '../../shared/dialogs/modalDialog.js';
import { t } from '../../shared/i18n/index.js';
import type { Item } from './items.js';

interface Answers {
  approve(): void;
  decline(): void;
}

function wrapped(text: string, styleClass: string): St.Label {
  const label = new St.Label({ text, style_class: styleClass, x_expand: true });
  label.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
  label.clutter_text.line_wrap = true;
  return label;
}

/** One change: its page and name, what it goes from and to, and what Settings warns about it. */
function changeRow(item: Item): St.Widget {
  const text = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-portal-row-text', x_expand: true });
  text.add_child(wrapped(item.title, 'kestrel-portal-row-title'));
  text.add_child(wrapped(t('changes-from-to', { from: item.from, to: item.to }), 'kestrel-portal-row-subtitle'));
  if (item.note) text.add_child(wrapped(item.note, 'kestrel-portal-row-subtitle kestrel-changes-note'));
  const row = new St.BoxLayout({ style_class: 'kestrel-portal-row', x_expand: true });
  row.add_child(text);
  return row;
}

/** The changes, scrolling once they are taller than the dialog allows, with the scrollbar beside them. */
function changeList(items: Item[]): St.ScrollView {
  const rows = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-portal-list', x_expand: true });
  for (const item of items) rows.add_child(changeRow(item));
  return dialogScroll(rows, 'kestrel-portal-scroll');
}

/** Every change of a set, from what it is to what it becomes, approved or declined as one. */
export class ReviewDialog {
  private answered = false;
  private readonly modal = new ModalDialog({ styleClass: 'kestrel-portal-dialog kestrel-changes-dialog', prompt: true, whileLocked: 'refuse' });

  constructor(items: Item[], requester: string | null, administrator: boolean, private readonly answers: Answers) {
    const count = items.length;
    const asked = requester ? t('changes-asked-by', { requester, count }) : t('changes-asked', { count });
    const description = administrator ? `${asked} ${t('changes-administrator')}` : asked;
    this.modal.contentLayout.add_child(new MessageDialogContent({ title: t('changes-title', { count }), description, icon_name: 'preferences-system-symbolic' }));
    const content = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-portal-content', x_expand: true });
    content.add_child(changeList(items));
    this.modal.contentLayout.add_child(content);
    this.modal.addButton({ label: t('changes-decline'), action: () => this.answer(false), default: true });
    this.modal.addButton({ label: t('changes-approve'), action: () => this.answer(true) });
    this.modal.connect('closed', () => {
      if (!this.answered) this.answers.decline();
      this.answered = true;
    });
  }

  open(): boolean {
    if (this.modal.open()) return true;
    this.modal.destroy();
    return false;
  }

  close(): void {
    this.answered = true;
    this.modal.close();
  }

  private answer(approved: boolean): void {
    if (this.answered) return;
    this.answered = true;
    if (approved) this.answers.approve();
    else this.answers.decline();
    this.modal.close();
  }
}
