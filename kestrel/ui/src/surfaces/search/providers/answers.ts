import GLib from 'gi://GLib';
import St from 'gi://St';

import { formatsLocale, t } from '../../../shared/i18n/index.js';
import { prewarmSoon } from '../../prewarm.js';
import { answer, answerSteps, type Answer, type Location } from '../answers/answers.js';
import { wallClock, zoneOffset, type Day, type Parts } from '../answers/calendar.js';
import { knownZone } from '../answers/zones.js';
import { themedIcon } from '../icons.js';
import type { SearchItem } from '../item.js';

type Of<Kind extends Answer['kind']> = Extract<Answer, { kind: Kind }>;

const UNITS: [keyof Parts, string][] = [['years', 'year'], ['months', 'month'], ['weeks', 'week'], ['days', 'day']];
const HOUR_MS = 3_600_000;
const ICONS: Record<Answer['kind'], string> = {
  span: 'x-office-calendar-symbolic', date: 'x-office-calendar-symbolic', time: 'preferences-system-time-symbolic', number: 'accessories-calculator-symbolic',
};

let local = { identifier: '', zone: '' };

function localZone(): string {
  const identifier = GLib.TimeZone.new_local().get_identifier();
  if (identifier !== local.identifier)
    local = { identifier, zone: knownZone(identifier) ? identifier : Intl.DateTimeFormat().resolvedOptions().timeZone };
  return local.zone;
}

const utc = ({ year, month, day }: Day) => Date.UTC(year, month - 1, day);

export class AnswerResults {
  private readonly locale = formatsLocale();
  private readonly fullDate = new Intl.DateTimeFormat(this.locale, { dateStyle: 'full', timeZone: 'UTC' });
  private readonly longDate = new Intl.DateTimeFormat(this.locale, { dateStyle: 'long', timeZone: 'UTC' });
  private readonly relative = new Intl.RelativeTimeFormat(this.locale, { numeric: 'auto' });
  private readonly list = new Intl.ListFormat(this.locale, { type: 'unit', style: 'long' });
  private readonly percent = new Intl.NumberFormat(this.locale, { style: 'percent', maximumFractionDigits: 4 });
  private readonly decimal = new Intl.NumberFormat(this.locale, { maximumSignificantDigits: 12 });
  private readonly amounts = new Map(UNITS.map(([, unit]) => [unit, new Intl.NumberFormat(this.locale, { style: 'unit', unit, unitDisplay: 'long' })]));
  private readonly clocks = new Map<string, [Intl.DateTimeFormat, Intl.DateTimeFormat]>();
  private stopPreparing = () => {};
  private prepared = false;

  constructor(private readonly close: () => void) {}

  prepare(): void {
    if (this.prepared) return;
    this.prepared = true;
    this.stopPreparing = prewarmSoon(answerSteps(this.locale));
  }

  destroy(): void {
    this.stopPreparing();
  }

  find(text: string): SearchItem | null {
    const found = answer(text, { locale: this.locale, now: Date.now(), zone: localZone() });
    if (!found) return null;
    const [title, description] = this.describe(found, text);
    return this.item(found.kind, title, description, found.kind === 'number' ? title.slice(2) : title);
  }

  private describe(found: Answer, text: string): [string, string] {
    switch (found.kind) {
      case 'span': return [this.duration(found.parts), this.spanDescription(found)];
      case 'date': return [this.fullDate.format(utc(found.date)), this.capitalized(this.relative.format(found.days, 'day'))];
      case 'time': return this.time(found);
      case 'number': return [`= ${found.percent ? this.percent.format(found.value / 100) : this.decimal.format(found.value)}`, t('start-search-calculation', { expression: text.trim() })];
    }
  }

  private duration(parts: Parts): string {
    const shown = UNITS.filter(([part]) => parts[part] > 0);
    if (!shown.length) return this.amounts.get('day')!.format(0);
    return this.list.format(shown.map(([part, unit]) => this.amounts.get(unit)!.format(parts[part])));
  }

  private spanDescription({ direction, from, to }: Of<'span'>): string {
    if (direction === 'until') return t('start-search-answer-until', { date: this.longDate.format(utc(to)) });
    if (direction === 'since') return t('start-search-answer-since', { date: this.longDate.format(utc(from)) });
    return t('start-search-answer-between', { from: this.longDate.format(utc(from)), to: this.longDate.format(utc(to)) });
  }

  private clock(zone: string): [Intl.DateTimeFormat, Intl.DateTimeFormat] {
    let formats = this.clocks.get(zone);
    if (!formats) {
      formats = [
        new Intl.DateTimeFormat(this.locale, { timeStyle: 'short', timeZone: zone }),
        new Intl.DateTimeFormat(this.locale, { weekday: 'long', hour: 'numeric', minute: '2-digit', timeZone: zone }),
      ];
      this.clocks.set(zone, formats);
    }
    return formats;
  }

  private wallTime(instant: number, at: Location, reference: Location): string {
    const [time, withDay] = this.clock(at.zone);
    const sameDay = wallClock(instant, at.zone).day === wallClock(instant, reference.zone).day;
    return sameDay ? time.format(instant) : this.capitalized(withDay.format(instant));
  }

  private time({ instant, at, from }: Of<'time'>): [string, string] {
    const here: Location = { zone: localZone(), place: '' };
    if (from) {
      const title = this.wallTime(instant, at, from);
      const source = this.clock(from.zone)[0].format(instant);
      const description = !at.place ? t('start-search-answer-converted-here', { time: source, from: from.place })
        : !from.place ? t('start-search-answer-converted-from-here', { time: source, place: at.place })
        : t('start-search-answer-converted', { time: source, from: from.place, place: at.place });
      return [title, description];
    }
    const title = this.wallTime(instant, at, here);
    if (!at.place) return [title, this.capitalized(this.relative.format(Math.round((instant - Date.now()) / HOUR_MS * 10) / 10, 'hour'))];
    const difference = (zoneOffset(at.zone, instant) - zoneOffset(here.zone, instant)) / 60;
    const hours = Math.abs(difference);
    const description = difference > 0 ? t('start-search-answer-time-ahead', { place: at.place, hours })
      : difference < 0 ? t('start-search-answer-time-behind', { place: at.place, hours })
      : t('start-search-answer-time-same', { place: at.place });
    return [title, description];
  }

  private capitalized(text: string): string {
    return text.charAt(0).toLocaleUpperCase(this.locale) + text.slice(1);
  }

  private item(kind: Answer['kind'], title: string, description: string, copy: string): SearchItem {
    return {
      key: 'answer', title, description, icon: themedIcon(ICONS[kind]), preview: { kind: 'answer' },
      activate: () => {
        St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, copy);
        this.close();
      },
    };
  }
}
