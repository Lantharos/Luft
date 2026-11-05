import type { Repeat } from '../model/types.js';
import { COUNT, countOf, MONTH, ORDINAL, orderOf, WEEKDAY, weekdayIn } from './words.js';
import type { Phrase } from './phrase.js';

const UNIT = '(day|week|month|year)s?';
const WEEKDAYS = [1, 2, 3, 4, 5];
const WEEKEND = [6, 0];
const ADVERBS: Record<string, Repeat['unit']> = { daily: 'day', weekly: 'week', monthly: 'month', yearly: 'year', annually: 'year' };

const ON_DATE = new RegExp(`\\b(?:on\\s+)?(?:the\\s+)?${ORDINAL}\\b(?:\\s+(?:of\\s+)?(?:the|each|every)\\s+month)?`, 'i');
const EVERY_DATE = new RegExp(`\\b(?:every|each)\\s+${ORDINAL}\\b(?:\\s+of\\s+(?:the|each|every)\\s+month)?`, 'i');
const DATE_OF_EVERY_MONTH = new RegExp(`\\b(?:on\\s+)?(?:the\\s+)?${ORDINAL}\\s+of\\s+(?:each|every)\\s+month\\b`, 'i');
const NTH_WEEKDAY = new RegExp(`\\b(?:(?:every|each|on)\\s+)?(?:the\\s+)?(first|second|third|fourth|last|\\d(?:st|nd|rd|th))\\s+${WEEKDAY}\\b(?:\\s+(?:of|in)\\s+(?:the|each|every)\\s+month)?`, 'i');
const LIST_OF_WEEKDAYS = new RegExp(`\\b(?:every|each)\\s+${WEEKDAY}(?:(?:\\s*,\\s*|\\s+and\\s+|\\s*&\\s*)${WEEKDAY})*\\b`, 'i');
const PLURAL_WEEKDAYS = new RegExp(`\\b(?:on\\s+)?${WEEKDAY}s\\b`, 'i');
const EVERY_YEAR_DATE = new RegExp(`\\b(?:every|each)(?=\\s+(?:${ORDINAL}|\\d{1,2})(?:\\s+of)?\\s+${MONTH}\\b|\\s+${MONTH}\\s+\\d)`, 'i');
const EVERY_UNIT = new RegExp(`\\b(?:every|each)\\s+(?:(other)\\s+|${COUNT}\\s+)?${UNIT}\\b`, 'i');

function monthlyOnDate(text: Phrase, repeat: Repeat): Repeat {
  const date = text.take(ON_DATE);
  return date ? { ...repeat, date: Number(date[1]) } : repeat;
}

function byUnit(text: Phrase): Repeat | null {
  const every = text.take(EVERY_UNIT);
  const adverb = every ? null : text.take(/\b(daily|weekly|monthly|yearly|annually)\b/i);
  if (!every && !adverb) return null;
  const unit = adverb ? ADVERBS[adverb[1]!.toLowerCase()]! : every![3]!.toLowerCase() as Repeat['unit'];
  const count = every?.[1] ? 2 : every?.[2] ? countOf(every[2]) : 1;
  const repeat: Repeat = { unit, every: count };
  return unit === 'month' ? monthlyOnDate(text, repeat) : repeat;
}

function byWeekdays(text: Phrase): Repeat | null {
  if (text.take(/\b(?:(?:every|each|on)\s+)?week\s?days\b|\b(?:every|each)\s+week\s?day\b/i)) return { unit: 'week', every: 1, weekdays: WEEKDAYS };
  if (text.take(/\b(?:(?:every|each|on)\s+weekends?|weekends)\b/i)) return { unit: 'week', every: 1, weekdays: WEEKEND };
  const list = text.take(LIST_OF_WEEKDAYS);
  if (list) {
    const named = [...list[0].matchAll(new RegExp(WEEKDAY, 'gi'))].map(found => weekdayIn(found[1]!));
    return { unit: 'week', every: 1, weekdays: named };
  }
  const plural = text.take(PLURAL_WEEKDAYS);
  return plural ? { unit: 'week', every: 1, weekdays: [weekdayIn(plural[1]!)] } : null;
}

function byMonthDate(text: Phrase): Repeat | null {
  const date = text.take(DATE_OF_EVERY_MONTH) ?? text.take(EVERY_DATE);
  return date ? { unit: 'month', every: 1, date: Number(date[1]) } : null;
}

function byNthWeekday(text: Phrase): Repeat | null {
  if (!text.has(new RegExp(`\\b(?:every|each)\\s+(?:first|second|third|fourth|last|\\d(?:st|nd|rd|th))\\s+${WEEKDAY}|(?:of|in)\\s+(?:each|every)\\s+month`, 'i'))) return null;
  const nth = text.take(NTH_WEEKDAY);
  return nth ? { unit: 'month', every: 1, nth: { week: orderOf(nth[1]!), weekday: weekdayIn(nth[2]!) } } : null;
}

/** Takes how often something repeats out of the text. */
export function readRepeat(text: Phrase): Repeat | null {
  if (text.take(EVERY_YEAR_DATE)) return { unit: 'year', every: 1 };
  return byNthWeekday(text) ?? byMonthDate(text) ?? byWeekdays(text) ?? byUnit(text);
}
