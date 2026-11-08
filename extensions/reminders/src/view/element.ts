import type { ElementLayout, Extension, View } from '@luft/extension-api';

import { addDays, dayOf } from '../model/days.js';
import { dueAt } from '../model/moments.js';
import { dueCount, sectionsOf } from '../model/sections.js';
import type { Reminder } from '../model/types.js';
import type { Granted, Reminders } from '../reminders.js';
import { shortWhen, timeText } from './say.js';

export const ICON = 'icons/reminders-symbolic.svg';
const WIDEST_TITLE = 220;
const WEEK = 7;

const icon = (layout: ElementLayout): View => ({ type: 'icon', icon: ICON, size: layout.icon });

function nextUp(extension: Extension<Granted>, reminders: Reminders, now: number): Reminder | null {
  const { rules, all } = reminders;
  const { today, upcoming } = sectionsOf(all, now, rules);
  const next = [...today, ...upcoming].find(reminder => dueAt(reminder.when!, rules) > now);
  if (!next) return null;
  const far = extension.settings.get<string>('taskbar-next-within') === 'today' ? dayOf(now) : addDays(dayOf(now), WEEK);
  return next.when!.day <= far ? next : null;
}

function nextLabel({ when }: Reminder, extension: Extension<Granted>, now: number): string {
  return when!.time && when!.day === dayOf(now) ? timeText(when!.time, when!.day) : shortWhen(extension, { ...when!, time: null }, now);
}

/** What the taskbar shows: how many are due, or what's next, as the person chose. */
export function compact(extension: Extension<Granted>, reminders: Reminders, layout: ElementLayout): View {
  const now = Date.now();
  const shows = extension.settings.get<string>('taskbar-shows');
  const due = dueCount(sectionsOf(reminders.all, now, reminders.rules), now, reminders.rules);
  const next = shows === 'next' && !due ? nextUp(extension, reminders, now) : null;
  const text = due && shows !== 'icon' ? String(due) : next ? nextLabel(next, extension, now) : null;
  if (!text) return icon(layout);
  return {
    type: layout.vertical ? 'column' : 'row',
    spacing: layout.vertical ? 2 : 6,
    align: 'center',
    children: [icon(layout), { type: 'text', text, style: 'number' }],
  };
}

/** Under the pointer it says what's first in line. */
export function expanded(extension: Extension<Granted>, reminders: Reminders, layout: ElementLayout): View {
  if (layout.vertical) return compact(extension, reminders, layout);
  const { t } = extension;
  const now = Date.now();
  const { rules, all } = reminders;
  const sections = sectionsOf(all, now, rules);
  const first = sections.overdue[0] ?? sections.today[0] ?? sections.upcoming[0];
  if (!first) return compact(extension, reminders, layout);
  const due = dueCount(sections, now, rules);
  return {
    type: 'row',
    spacing: 8,
    align: 'center',
    children: [
      icon(layout),
      {
        type: 'column',
        spacing: 0,
        align: 'start',
        children: [
          { type: 'text', text: first.title, maxWidth: WIDEST_TITLE },
          { type: 'text', text: due > 1 ? t('more-due', { count: due }) : shortWhen(extension, first.when!, now), style: 'caption' },
        ],
      },
    ],
  };
}
