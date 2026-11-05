import type { Extension, Popup, TaskbarElement, View } from '@luft/extension-api';

import { sectionsOf } from '../model/sections.js';
import type { Reminder } from '../model/types.js';
import { parse, type Parsed } from '../parse/parse.js';
import type { Granted, Reminders } from '../reminders.js';
import { ReminderForm } from './form.js';
import { draftOf, previewOf, usesDayFirst } from './quickAdd.js';
import { actionsRow, reminderRow } from './rows.js';

const WIDTH = 400;
const SHOWN_UPCOMING = 12;

interface Undo {
  text: string;
  reminder: Reminder;
}

/** The pop-up: quick add on top, then what's overdue, today's, what's coming and to-dos with no date. */
export class RemindersPanel {
  private popup: Popup | null = null;
  private draft = '';
  private opened: string | null = null;
  private allUpcoming = false;
  private form: ReminderForm | null = null;
  private undo: Undo | null = null;

  constructor(
    private readonly extension: Extension<Granted>,
    private readonly reminders: Reminders,
    private readonly anchor: () => TaskbarElement,
  ) {}

  toggle(): void {
    if (this.popup?.open) this.popup.dispose();
    else this.show();
  }

  /** Opens the pop-up, with one reminder's actions showing if there's one to look at. */
  show(id?: string): void {
    this.opened = id ?? this.opened;
    if (this.popup?.open) {
      this.refresh();
      return;
    }
    this.popup = this.extension.popups.open({
      anchor: this.anchor(),
      title: this.extension.t('reminders'),
      width: WIDTH,
      content: this.view(),
      onClosed: () => this.closed(),
    });
  }

  refresh(): void {
    if (this.popup?.open) this.popup.update(this.view());
  }

  private closed(): void {
    this.popup = null;
    this.form = null;
    this.opened = null;
    this.undo = null;
  }

  private view(): View {
    return this.form ? this.form.view() : { type: 'column', spacing: 10, children: [...this.quickAdd(), ...this.undoBar(), ...this.lists()] };
  }

  private quickAdd(): View[] {
    const { t } = this.extension;
    const parsed = this.parsed();
    const entry: View = {
      type: 'entry',
      label: t('add'),
      placeholder: t('add-placeholder'),
      text: this.draft,
      onChanged: text => {
        this.draft = text;
        this.refresh();
      },
      onSubmit: () => this.addDraft(),
    };
    return parsed ? [entry, previewOf(this.extension, parsed, () => this.addDraft())] : [entry];
  }

  private parsed(): Parsed | null {
    return this.draft.trim() ? parse(this.draft, Date.now(), usesDayFirst()) : null;
  }

  private addDraft(): void {
    const parsed = this.parsed();
    if (!parsed?.title) return;
    this.reminders.add(draftOf(this.extension, parsed));
    this.draft = '';
    this.refresh();
  }

  private undoBar(): View[] {
    const { undo } = this;
    if (!undo) return [];
    return [{
      type: 'row',
      children: [
        { type: 'text', text: undo.text, style: 'caption', maxWidth: 260 },
        { type: 'spacer' },
        { type: 'button', label: this.extension.t('undo'), small: true, style: 'flat', onActivate: () => this.takeBack(undo) },
      ],
    }];
  }

  private takeBack(undo: Undo): void {
    this.undo = null;
    this.reminders.restore(undo.reminder);
  }

  private section(title: string, list: readonly Reminder[], now: number): View[] {
    if (!list.length) return [];
    const rows = list.flatMap((reminder): View[] => {
      const row = reminderRow(this.extension, reminder, now, {
        done: () => this.finish(reminder),
        toggle: () => this.toggleRow(reminder.id),
      });
      return this.opened === reminder.id ? [row, actionsRow(this.extension, this.reminders, reminder, now, {
        edit: () => this.edit(reminder),
        remove: () => this.remove(reminder),
      })] : [row];
    });
    return [{ type: 'column', spacing: 2, children: [{ type: 'text', text: title, style: 'caption' }, ...rows] }];
  }

  private lists(): View[] {
    const { t } = this.extension;
    const { all, rules } = this.reminders;
    const now = Date.now();
    const { overdue, today, upcoming, undated } = sectionsOf(all, now, rules);
    const shown = this.allUpcoming ? upcoming : upcoming.slice(0, SHOWN_UPCOMING);
    const hidden = upcoming.length - shown.length;
    const sections = [
      ...this.section(t('overdue'), overdue, now),
      ...this.section(t('today'), today, now),
      ...this.section(t('upcoming'), shown, now),
      ...hidden ? [{ type: 'button', label: t('show-more', { count: hidden }), small: true, style: 'flat', onActivate: () => this.showAll() } as View] : [],
      ...this.section(t('no-date-section'), undated, now),
    ];
    return sections.length || this.draft ? sections : [{ type: 'text', text: t('empty'), style: 'caption' }];
  }

  private showAll(): void {
    this.allUpcoming = true;
    this.refresh();
  }

  private toggleRow(id: string): void {
    this.opened = this.opened === id ? null : id;
    this.refresh();
  }

  private finish(reminder: Reminder): void {
    this.undo = { text: this.extension.t('done-note', { title: reminder.title }), reminder };
    this.reminders.complete(reminder.id);
  }

  private remove(reminder: Reminder): void {
    this.undo = { text: this.extension.t('deleted-note', { title: reminder.title }), reminder };
    this.opened = null;
    this.reminders.remove(reminder.id);
  }

  private edit(reminder: Reminder): void {
    this.form = new ReminderForm(this.extension, this.reminders, reminder, () => this.refresh(), () => {
      this.form = null;
      this.refresh();
    });
    this.refresh();
  }
}
