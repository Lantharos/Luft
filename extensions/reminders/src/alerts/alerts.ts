import type { Extension, Notification } from '@luft/extension-api';

import { addDays, dayOf, instantOf } from '../model/days.js';
import type { Rules } from '../model/moments.js';
import type { Reminder } from '../model/types.js';
import type { Bell, Due, Granted, Reminders } from '../reminders.js';
import { ICON } from '../view/element.js';
import { messageFor } from './copy.js';

const MINUTE_MS = 60_000;
const MOST_AT_ONCE = 3;

/** Turns what came due into notifications. A reminder has one at a time: when it comes back, the new one replaces the last. */
export class Alerts implements Bell {
  private readonly showing = new Map<string, Notification>();
  private summary: Notification | null = null;

  constructor(
    private readonly extension: Extension<Granted>,
    private readonly reminders: Reminders,
    private readonly open: (id?: string) => void,
  ) {}

  ring(due: readonly Due[], now: number, rules: Rules): void {
    for (const { reminder } of due) this.answered(reminder.id);
    if (due.length > MOST_AT_ONCE) this.summarize(due);
    else for (const item of due) this.send(item, now, rules);
  }

  answered(id: string): void {
    this.showing.get(id)?.dispose();
    this.showing.delete(id);
  }

  private summarize(due: readonly Due[]): void {
    const { t, notifications } = this.extension;
    const titles = new Intl.ListFormat(undefined, { type: 'conjunction' }).format(due.slice(0, MOST_AT_ONCE).map(({ reminder }) => reminder.title));
    this.summary?.dispose();
    this.summary = notifications.send({
      title: t('notice-many', { count: due.length }),
      body: t('notice-many-body', { titles, more: due.length - MOST_AT_ONCE }),
      icon: ICON,
      onActivate: () => this.open(),
      actions: [{ label: t('open'), onActivate: () => this.open() }],
    });
  }

  private snoozeLabel(reminder: Reminder): string {
    const { t, settings } = this.extension;
    return reminder.kind === 'goal' ? t('not-today') : t('snooze-for', { minutes: Number(settings.get<string>('snooze')) });
  }

  private snoozeEnd(reminder: Reminder, rules: Rules): number {
    const now = Date.now();
    if (reminder.kind === 'goal') return instantOf(addDays(dayOf(now), 1), rules.morning);
    return now + Number(this.extension.settings.get<string>('snooze')) * MINUTE_MS;
  }

  private send({ reminder, kind }: Due, now: number, rules: Rules): void {
    const { extension, reminders } = this;
    const { id } = reminder;
    this.showing.set(id, extension.notifications.send({
      ...messageFor(extension, reminder, kind, now, rules),
      icon: ICON,
      onActivate: () => this.open(id),
      actions: kind === 'warn' ? [] : [
        { label: extension.t('done'), onActivate: () => reminders.complete(id) },
        { label: this.snoozeLabel(reminder), onActivate: () => reminders.snooze(id, this.snoozeEnd(reminder, rules)) },
      ],
    }));
  }
}
