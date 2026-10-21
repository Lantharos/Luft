import { dayNumber, type Day } from '../../../shared/days.js';
import { addDays, valid, weekday } from './calendar.js';
import { Cursor, tokens } from './text.js';
import { FILLERS, HOLIDAYS, LAST, NEXT, ORDINAL, PHRASE_LOCALES, TODAY, TOMORROW, UNIT_WORDS, YESTERDAY, type Unit } from './vocabulary.js';

type Order = 'dmy' | 'mdy' | 'ymd';
type Prefer = 'future' | 'past' | 'this';

export type DateSpec =
  | { kind: 'day'; month: number; day: number; year?: number }
  | { kind: 'relative'; days: number }
  | { kind: 'weekday'; weekday: number; which: 'next' | 'last' | 'nearest' };

export interface Template {
  before: string[];
  after: string[];
  unit: Unit;
  sign: 1 | -1;
}

export interface Lexicon {
  months: Map<string, number>;
  monthStems: [string, number][];
  weekdays: Map<string, number>;
  relativeDays: Map<string, number>;
  units: Map<string, Unit>;
  templates: Template[];
  order: Order;
}

const INTL_UNITS: [Intl.RelativeTimeFormatUnit, Unit][] = [['minute', 'minutes'], ['hour', 'hours'], ['day', 'days'], ['week', 'weeks'], ['month', 'months'], ['year', 'years']];
const COUNTS = [1, 2, 3, 5, 21];
const SUNDAY = Date.UTC(2024, 0, 7);
const lexicons = new Map<string, Lexicon>();

const meaningful = (text: string) => tokens(text).filter(token => !FILLERS.has(token));
const lastWord = (text: string) => tokens(text).filter(token => !/^\d/.test(token)).pop();

function supported(locale: string): boolean {
  try {
    return Intl.DateTimeFormat.supportedLocalesOf([locale]).length > 0;
  } catch {
    return false;
  }
}

function setFirst<K, V>(map: Map<K, V>, key: K | undefined, value: V): void {
  if (key !== undefined && !map.has(key)) map.set(key, value);
}

function addMonths(months: Map<string, number>, locale: string): void {
  const formats = [{ month: 'long' }, { month: 'short' }, { day: 'numeric', month: 'long' }, { day: 'numeric', month: 'short' }] as const;
  for (const options of formats) {
    const format = new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' });
    for (let month = 1; month <= 12; month++) {
      const part = format.formatToParts(Date.UTC(2021, month - 1, 15)).find(({ type }) => type === 'month');
      if (part) setFirst(months, lastWord(part.value), month);
    }
  }
}

function addWeekdays(weekdays: Map<string, number>, locale: string): void {
  for (const style of ['long', 'short'] as const) {
    const format = new Intl.DateTimeFormat(locale, { weekday: style, timeZone: 'UTC' });
    for (let day = 0; day < 7; day++) setFirst(weekdays, lastWord(format.format(SUNDAY + day * 86_400_000)), day);
  }
}

function addRelative(lexicon: Lexicon, locale: string): void {
  const automatic = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  for (let days = -2; days <= 2; days++) {
    const found = meaningful(automatic.format(days, 'day'));
    if (found.length === 1 && !/\d/.test(found[0])) setFirst(lexicon.relativeDays, found[0], days);
  }
  const now = meaningful(automatic.format(0, 'second'));
  if (now.length === 1) setFirst(lexicon.relativeDays, now[0], 0);
  const always = new Intl.RelativeTimeFormat(locale, { numeric: 'always' });
  for (const [intlUnit, unit] of INTL_UNITS) {
    for (const count of COUNTS) {
      for (const sign of [1, -1] as const) {
        const parts = always.formatToParts(sign * count, intlUnit);
        const number = parts.findIndex(({ type }) => type === 'integer');
        if (number < 0) continue;
        const before = meaningful(parts.slice(0, number).map(({ value }) => value).join(''));
        const after = meaningful(parts.slice(number + 1).filter(({ type }) => type === 'literal').map(({ value }) => value).join(''));
        const key = [unit, sign, ...before, '#', ...after].join(' ');
        if (!lexicon.templates.some(template => [template.unit, template.sign, ...template.before, '#', ...template.after].join(' ') === key))
          lexicon.templates.push({ before, after, unit, sign });
      }
    }
    for (const unitDisplay of ['long', 'short'] as const) {
      const format = new Intl.NumberFormat(locale, { style: 'unit', unit: intlUnit.replace(/s$/, ''), unitDisplay });
      for (const count of [...COUNTS, 100]) {
        for (const part of format.formatToParts(count))
          if (part.type === 'unit') for (const word of tokens(part.value)) if (word.length > 1) setFirst(lexicon.units, word, unit);
      }
    }
  }
}

function numericOrder(locale: string): Order {
  const order = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'UTC' })
    .formatToParts(Date.UTC(2021, 2, 27)).map(({ type }) => type[0]).filter(type => 'dmy'.includes(type)).join('');
  return order === 'mdy' || order === 'ymd' ? order : 'dmy';
}

function emptyLexicon(): Lexicon {
  const found: Lexicon = { months: new Map(), monthStems: [], weekdays: new Map(), relativeDays: new Map(), units: new Map(), templates: [], order: 'dmy' };
  for (const [unit, unitWords] of Object.entries(UNIT_WORDS) as [Unit, Set<string>][]) for (const word of unitWords) found.units.set(word, unit);
  for (const [set, days] of [[TODAY, 0], [TOMORROW, 1], [YESTERDAY, -1]] as const) for (const word of set) found.relativeDays.set(word, days);
  return found;
}

function addLanguage(found: Lexicon, language: string): void {
  addMonths(found.months, language);
  addWeekdays(found.weekdays, language);
  addRelative(found, language);
}

function finish(found: Lexicon, locale: string): void {
  setFirst(found.months, 'sept', 9);
  found.monthStems = [...found.months].filter(([name]) => name.length >= 3).sort(([a], [b]) => b.length - a.length);
  found.order = supported(locale) ? numericOrder(locale) : 'dmy';
  lexicons.set(locale, found);
}

export function lexiconSteps(locale: string): (() => void)[] {
  if (lexicons.has(locale)) return [];
  const found = emptyLexicon();
  const languages = [...new Set([locale, ...PHRASE_LOCALES])].filter(supported);
  return [...languages.map(language => () => addLanguage(found, language)), () => finish(found, locale)];
}

export function lexicon(locale: string): Lexicon {
  if (!lexicons.has(locale)) for (const step of lexiconSteps(locale)) step();
  return lexicons.get(locale)!;
}

function month(token: string | undefined, words: Lexicon): number | null {
  if (token === undefined) return null;
  const exact = words.months.get(token.replace(/\.$/, ''));
  if (exact) return exact;
  const stem = words.monthStems.find(([name]) => token.startsWith(name) && token.length - name.length <= 3);
  return stem?.[1] ?? null;
}

function dayOfMonth(token: string | undefined): number | null {
  const match = token?.match(/^(\d{1,2})\.?$/);
  const day = match ? Number(match[1]) : 0;
  return day >= 1 && day <= 31 ? day : null;
}

function year(cursor: Cursor): number | undefined {
  const match = cursor.peek()?.match(/^(\d{4})\.?$/);
  if (!match) return undefined;
  cursor.at++;
  return Number(match[1]);
}

const fullYear = (text: string) => text.length === 2 ? 2000 + Number(text) : Number(text);

function numeric(token: string, order: Order): DateSpec | null {
  const iso = token.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) return { kind: 'day', year: Number(iso[1]), month: Number(iso[2]), day: Number(iso[3]) };
  const match = token.match(/^(\d{1,2})([./-])(\d{1,2})(?:\2(\d{4}|\d{2}))?\.?$/);
  if (!match) return null;
  const [, first, separator, second, yearText] = match;
  const [day, month] = separator === '/' && order === 'mdy' ? [second, first] : [first, second];
  if (separator !== '.' && !yearText) return null;
  return { kind: 'day', day: Number(day), month: Number(month), ...yearText ? { year: fullYear(yearText) } : {} };
}

function holiday(cursor: Cursor): DateSpec | null {
  for (const [phrase, month, day] of HOLIDAYS) {
    if (phrase.every((word, index) => cursor.peek(index) === word)) {
      cursor.at += phrase.length;
      return { kind: 'day', month, day, year: year(cursor) };
    }
  }
  return null;
}

function named(cursor: Cursor, words: Lexicon): DateSpec | null {
  const first = cursor.peek();
  const leadingDay = dayOfMonth(first);
  if (leadingDay !== null) {
    cursor.at++;
    cursor.word(ORDINAL);
    const found = month(cursor.take(), words);
    return found ? { kind: 'day', day: leadingDay, month: found, year: year(cursor) } : null;
  }
  const leadingMonth = month(first, words);
  if (leadingMonth === null) return null;
  cursor.at++;
  const day = dayOfMonth(cursor.take());
  if (day === null) return null;
  cursor.word(ORDINAL);
  return { kind: 'day', day, month: leadingMonth, year: year(cursor) };
}

function weekdaySpec(cursor: Cursor, words: Lexicon): DateSpec | null {
  const which = cursor.word(NEXT) ? 'next' : cursor.word(LAST) ? 'last' : 'nearest';
  const day = words.weekdays.get(cursor.take() ?? '');
  return day === undefined ? null : { kind: 'weekday', weekday: day, which };
}

export function parseDate(cursor: Cursor, words: Lexicon): DateSpec | null {
  const token = cursor.peek();
  if (token === undefined) return null;
  const relative = words.relativeDays.get(token);
  if (relative !== undefined) {
    cursor.at++;
    return { kind: 'relative', days: relative };
  }
  const number = numeric(token, words.order);
  if (number?.kind === 'day') {
    cursor.at++;
    return number.year === undefined ? { ...number, year: year(cursor) } : number;
  }
  return cursor.attempt(holiday) ?? cursor.attempt(current => named(current, words)) ?? cursor.attempt(current => weekdaySpec(current, words));
}

export function resolve(spec: DateSpec, today: Day, prefer: Prefer): Day | null {
  if (spec.kind === 'relative') return addDays(today, spec.days);
  if (spec.kind === 'weekday') {
    const ahead = (spec.weekday - weekday(today) + 7) % 7;
    const behind = (weekday(today) - spec.weekday + 7) % 7;
    if (spec.which === 'last' || (spec.which === 'nearest' && prefer === 'past')) return addDays(today, -(behind || 7));
    return addDays(today, spec.which === 'next' || prefer === 'future' ? ahead || 7 : ahead);
  }
  const candidate = { year: spec.year ?? today.year, month: spec.month, day: spec.day };
  if (spec.year === undefined && prefer === 'future' && dayNumber(candidate) < dayNumber(today)) candidate.year++;
  if (spec.year === undefined && prefer === 'past' && dayNumber(candidate) > dayNumber(today)) candidate.year--;
  return valid(candidate) ? candidate : null;
}
