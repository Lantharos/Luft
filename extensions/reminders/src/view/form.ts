import type { Extension, View } from '@luft/extension-api';

import { partsOf } from '../model/days.js';
import type { Draft, Kind, Reminder, Repeat, When } from '../model/types.js';
import { parse } from '../parse/parse.js';
import { Phrase } from '../parse/phrase.js';
import { readRepeat } from '../parse/repeat.js';
import { MONTHS } from '../parse/words.js';
import type { Granted, Reminders } from '../reminders.js';
import { usesDayFirst } from './quickAdd.js';
import { repeatText, spokenWhen } from './say.js';

type RepeatChoice = 'none' | 'day' | 'week' | 'month' | 'year' | 'custom';

const HEADS_UP_DAYS = [0, 1, 3, 7, 14];
const NUDGE_DAYS = [1, 3, 7, 0];

/** A date the way quick add reads it. */
function writtenWhen(when: When | null): string {
  if (!when) return '';
  const { year, month, day } = partsOf(when.day);
  return `${day} ${MONTHS[month - 1]} ${year}${when.time ? ` ${when.time}` : ''}`;
}

function choiceOf(repeat: Repeat | null): RepeatChoice {
  if (!repeat) return 'none';
  return repeat.every === 1 && !repeat.weekdays?.length && !repeat.nth ? repeat.unit : 'custom';
}

/** Editing one reminder, in place of the list. Its date is typed the same way as in quick add. */
export class ReminderForm {
  private readonly draft: Draft;
  private whenText: string;
  private repeatChoice: RepeatChoice;
  private repeatText = '';

  constructor(
    private readonly extension: Extension<Granted>,
    private readonly reminders: Reminders,
    private readonly reminder: Reminder,
    private readonly changed: () => void,
    private readonly close: () => void,
  ) {
    const { title, kind, when, repeat, headsUp, persistent, nudgeDays } = reminder;
    this.draft = { title, kind, when, repeat, headsUp, persistent, nudgeDays };
    this.whenText = writtenWhen(when);
    this.repeatChoice = choiceOf(repeat);
  }

  private set(change: Partial<Draft>): void {
    Object.assign(this.draft, change);
    this.changed();
  }

  private readWhen(text: string): void {
    this.whenText = text;
    const { when } = parse(text, Date.now(), usesDayFirst());
    this.set({ when: text.trim() ? when : null });
  }

  /** A birthday is yearly with a heads-up unless it already says otherwise. */
  private pickKind(kind: Kind): void {
    if (kind !== 'birthday' || this.draft.repeat) return this.set({ kind });
    this.repeatChoice = 'year';
    this.set({ kind, repeat: { unit: 'year', every: 1 }, headsUp: Number(this.extension.settings.get<string>('birthday-heads-up')) });
  }

  private pickRepeat(choice: RepeatChoice): void {
    this.repeatChoice = choice;
    if (choice === 'custom') return this.changed();
    this.set({ repeat: choice === 'none' ? null : { unit: choice, every: 1 } });
  }

  private readRepeatText(text: string): void {
    this.repeatText = text;
    this.set({ repeat: readRepeat(new Phrase(text)) });
  }

  private pick<Value>(options: readonly Value[], chosen: Value, label: (value: Value) => string, picked: (value: Value) => void): View {
    return {
      type: 'row',
      spacing: 4,
      children: options.map((value): View => ({
        type: 'button', label: label(value), small: true, style: value === chosen ? 'default' : 'flat', onActivate: () => picked(value),
      })),
    };
  }

  private kinds(): View {
    const { t } = this.extension;
    const names: Record<Kind, string> = { reminder: t('kind-reminder'), birthday: t('kind-birthday'), goal: t('kind-goal') };
    return this.pick<Kind>(['reminder', 'birthday', 'goal'], this.draft.kind, kind => names[kind], kind => this.pickKind(kind));
  }

  private repeats(): View[] {
    const { t } = this.extension;
    const names: Record<RepeatChoice, string> = {
      none: t('repeat-none'), day: t('repeat-daily'), week: t('repeat-weekly'), month: t('repeat-monthly'), year: t('repeat-yearly'), custom: t('repeat-custom'),
    };
    const { repeat, when } = this.draft;
    return [
      this.pick<RepeatChoice>(['none', 'day', 'week', 'month', 'year', 'custom'], this.repeatChoice, choice => names[choice], choice => this.pickRepeat(choice)),
      ...this.repeatChoice === 'custom' ? [{
        type: 'entry', label: t('repeat-custom'), placeholder: t('repeat-custom-placeholder'), text: this.repeatText, onChanged: text => this.readRepeatText(text),
      } as View] : [],
      ...repeat ? [{ type: 'text', text: repeatText(this.extension, repeat, when), style: 'caption' } as View] : [],
    ];
  }

  private byKind(): View[] {
    const { t } = this.extension;
    const { kind, headsUp, nudgeDays, persistent } = this.draft;
    if (kind === 'goal') {
      return [
        { type: 'text', text: t('nudge-how-often'), style: 'caption' },
        this.pick(NUDGE_DAYS, nudgeDays ?? Number(this.extension.settings.get<string>('goal-nudge-every')), days => (days ? t('every-days', { days }) : t('never')), days => this.set({ nudgeDays: days })),
      ];
    }
    return [
      ...kind === 'birthday' ? [
        { type: 'text', text: t('heads-up-how-soon'), style: 'caption' } as View,
        this.pick(HEADS_UP_DAYS, headsUp, days => (days ? t('days-before', { days }) : t('never')), days => this.set({ headsUp: days })),
      ] : [],
      { type: 'switch', label: t('come-back-switch'), checked: persistent, onToggled: checked => this.set({ persistent: checked }) },
    ];
  }

  private save(): void {
    this.reminders.edit(this.reminder.id, { ...this.draft, title: this.draft.title.trim() });
    this.close();
  }

  view(): View {
    const { t } = this.extension;
    const { title, when } = this.draft;
    return {
      type: 'column',
      spacing: 10,
      children: [
        { type: 'entry', label: t('edit-title'), text: title, onChanged: text => this.set({ title: text }), onSubmit: () => this.save() },
        { type: 'entry', label: t('edit-when'), placeholder: t('edit-when-placeholder'), text: this.whenText, onChanged: text => this.readWhen(text), onSubmit: () => this.save() },
        { type: 'text', text: when ? spokenWhen(this.extension, when, Date.now()) : t('preview-no-date'), style: 'caption' },
        this.kinds(),
        ...this.repeats(),
        ...this.byKind(),
        {
          type: 'row',
          spacing: 8,
          children: [
            { type: 'spacer' },
            { type: 'button', label: t('cancel'), onActivate: this.close },
            { type: 'button', label: t('save'), style: 'primary', disabled: !title.trim(), onActivate: () => this.save() },
          ],
        },
      ],
    };
  }
}
