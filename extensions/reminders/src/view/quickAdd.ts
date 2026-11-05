import type { Extension, View } from '@luft/extension-api';

import type { Draft } from '../model/types.js';
import type { Parsed } from '../parse/parse.js';
import type { Granted } from '../reminders.js';
import { repeatText, spokenWhen } from './say.js';

/** Whether people here write the day before the month, as in 14/3. */
export function usesDayFirst(): boolean {
  const parts = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'numeric' }).formatToParts(0).map(part => part.type);
  return parts.indexOf('day') < parts.indexOf('month');
}

export function draftOf({ settings }: Extension<Granted>, parsed: Parsed): Draft {
  const { title, kind, when, repeat, headsUp } = parsed;
  return {
    title,
    kind,
    when,
    repeat,
    headsUp: headsUp ?? (kind === 'birthday' ? Number(settings.get<string>('birthday-heads-up')) : 0),
    persistent: settings.get<boolean>('come-back'),
    nudgeDays: null,
  };
}

function understood(extension: Extension<Granted>, parsed: Parsed): string[] {
  const { t } = extension;
  const { when, repeat, headsUp, kind } = parsed;
  const draft = draftOf(extension, parsed);
  return [
    when ? spokenWhen(extension, when, Date.now()) : t('preview-no-date'),
    ...repeat ? [repeatText(extension, repeat, when)] : [],
    ...kind === 'goal' ? [t('preview-goal')] : [],
    ...draft.headsUp && when ? [t('preview-heads-up', { days: headsUp ?? draft.headsUp })] : [],
  ];
}

/** What the text was understood as, shown as it's typed, so nothing gets added by surprise. */
export function previewOf(extension: Extension<Granted>, parsed: Parsed, add: () => void): View {
  return {
    type: 'row',
    spacing: 8,
    children: [
      {
        type: 'column',
        spacing: 2,
        align: 'start',
        children: [
          { type: 'text', text: parsed.title || extension.t('preview-untitled'), maxWidth: 270 },
          ...understood(extension, parsed).map((line): View => ({ type: 'text', text: line, style: 'caption', maxWidth: 270 })),
        ],
      },
      { type: 'spacer' },
      { type: 'button', label: extension.t('add-button'), small: true, style: 'primary', disabled: !parsed.title, onActivate: add },
    ],
  };
}
