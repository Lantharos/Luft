import type { Extension, View } from '@luft/extension-api';

import { addDays, dayOf, instantOf } from '../model/days.js';
import { dueAt } from '../model/moments.js';
import type { Reminder } from '../model/types.js';
import type { Granted, Reminders } from '../reminders.js';
import { rowDetail } from './say.js';

const HOUR_MS = 3_600_000;
const MINUTE_MS = 60_000;
const OPEN_CIRCLE = 'icons/open-symbolic.svg';

interface RowActions {
  done(): void;
  toggle(): void;
}

export function reminderRow(extension: Extension<Granted>, reminder: Reminder, now: number, { done, toggle }: RowActions): View {
  return {
    type: 'row',
    spacing: 2,
    children: [
      { type: 'button', icon: OPEN_CIRCLE, iconOnly: true, small: true, style: 'flat', label: extension.t('mark-done', { title: reminder.title }), onActivate: done },
      { type: 'item', title: reminder.title, subtitle: rowDetail(extension, reminder, now), onActivate: toggle },
    ],
  };
}

interface OpenActions {
  edit(): void;
  remove(): void;
}

function snoozes(extension: Extension<Granted>, reminders: Reminders, reminder: Reminder, now: number): View[] {
  const { t, settings } = extension;
  const { rules } = reminders;
  const minutes = Number(settings.get<string>('snooze'));
  const later = (label: string, at: () => number): View => ({ type: 'button', label, small: true, style: 'flat', onActivate: () => reminders.snooze(reminder.id, at()) });
  if (!reminder.when || dueAt(reminder.when, rules) > now) return [];
  return [
    later(t('snooze-short', { minutes }), () => Date.now() + minutes * MINUTE_MS),
    later(t('snooze-hour'), () => Date.now() + HOUR_MS),
    later(t('snooze-tomorrow'), () => instantOf(addDays(dayOf(Date.now()), 1), rules.morning)),
  ];
}

/** What can be done with a reminder, under its row once it's opened. */
export function actionsRow(extension: Extension<Granted>, reminders: Reminders, reminder: Reminder, now: number, { edit, remove }: OpenActions): View {
  const { t } = extension;
  return {
    type: 'row',
    spacing: 2,
    children: [
      ...snoozes(extension, reminders, reminder, now),
      { type: 'spacer' },
      { type: 'button', icon: 'document-edit-symbolic', iconOnly: true, small: true, style: 'flat', label: t('edit'), onActivate: edit },
      { type: 'button', icon: 'user-trash-symbolic', iconOnly: true, small: true, style: 'flat', label: t('delete'), onActivate: remove },
    ],
  };
}
