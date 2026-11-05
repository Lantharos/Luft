import { addDays, type Day, dayOf, makeDay, partsOf, weekdayOf } from '../model/days.js';
import type { Phrase } from './phrase.js';
import { COUNT, countOf, FULL_WEEKDAY, MONTH, monthOf, ORDINAL, WEEKDAY, weekdayIn } from './words.js';

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DUE = '(?:(on|by|due|before|for|until)\\s+)?';
const WHOLE_DAY_WORDS: Record<string, string> = {
  noon: '12:00', midday: '12:00', lunchtime: '12:00', midnight: '00:00', morning: '09:00', afternoon: '14:00', evening: '18:00', tonight: '20:00',
};

export interface Found {
  day: Day | null;
  time: string | null;
  /** Whether the date was given as a limit, such as "by friday". */
  deadline: boolean;
}

const clock = (hours: number, minutes: number) => `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
const isLimit = (word?: string) => !!word && /^(?:by|due|before|until)$/i.test(word);

function yearFor(month: number, date: number, today: Day): number {
  const { year } = partsOf(today);
  return makeDay(year, month, date) >= today ? year : year + 1;
}

function fullYear(written: string | undefined): number | null {
  if (!written) return null;
  const year = Number(written);
  return year < 100 ? 2000 + year : year;
}

const dated = (month: number, date: number, year: number | null, today: Day) => makeDay(year ?? yearFor(month, date, today), month, date);

function nextDate(date: number, today: Day): Day {
  const { year, month, day } = partsOf(today);
  return day <= date ? makeDay(year, month, date) : makeDay(year, month + 1, date);
}

function namedWeekday(weekday: number, which: string | undefined, today: Day, later: boolean): Day {
  const ahead = (weekday - weekdayOf(today) + 7) % 7;
  if (which?.toLowerCase() !== 'next') return ahead === 0 && !later ? addDays(today, 7) : addDays(today, ahead);
  const thisMonday = addDays(today, -((weekdayOf(today) + 6) % 7));
  return addDays(thisMonday, 7 + (weekday + 6) % 7);
}

interface DateRule {
  pattern: RegExp;
  read(match: RegExpExecArray, today: Day, later: boolean): Day;
}

const DATE_RULES: DateRule[] = [
  {
    pattern: new RegExp(`\\b${DUE}(\\d{4})-(\\d{2})-(\\d{2})\\b`, 'i'),
    read: found => makeDay(Number(found[2]), Number(found[3]), Number(found[4])),
  },
  {
    pattern: new RegExp(`\\b${DUE}(?:the\\s+)?(?:${ORDINAL}|(\\d{1,2}))(?:\\s+of)?\\s+${MONTH}\\b,?(?:\\s+(\\d{4}))?`, 'i'),
    read: (found, today) => dated(monthOf(found[4]!), Number(found[2] ?? found[3]), fullYear(found[5]), today),
  },
  {
    pattern: new RegExp(`\\b${DUE}${MONTH}\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b(?!:)(?:,?\\s+(\\d{4}))?`, 'i'),
    read: (found, today) => dated(monthOf(found[2]!), Number(found[3]), fullYear(found[4]), today),
  },
  { pattern: new RegExp(`\\b${DUE}(?:the\\s+)?day\\s+after\\s+tomorrow\\b`, 'i'), read: (_found, today) => addDays(today, 2) },
  { pattern: new RegExp(`\\b${DUE}(?:tomorrow|tmrw?)\\b`, 'i'), read: (_found, today) => addDays(today, 1) },
  { pattern: new RegExp(`\\b${DUE}today\\b`, 'i'), read: (_found, today) => today },
  { pattern: new RegExp(`\\b${DUE}next\\s+week\\b`, 'i'), read: (_found, today) => addDays(today, 7) },
  {
    pattern: new RegExp(`\\b${DUE}next\\s+month\\b`, 'i'),
    read: (_found, today) => {
      const { year, month, day } = partsOf(today);
      return makeDay(year, month + 1, day);
    },
  },
  {
    pattern: new RegExp(`\\b${DUE}next\\s+year\\b`, 'i'),
    read: (_found, today) => {
      const { year, month, day } = partsOf(today);
      return makeDay(year + 1, month, day);
    },
  },
  { pattern: new RegExp(`\\b${DUE}(?:this\\s+)?weekend\\b`, 'i'), read: (_found, today) => addDays(today, (6 - weekdayOf(today) + 7) % 7) },
  { pattern: new RegExp(`\\b${DUE}(?:(next|this)\\s+)?${FULL_WEEKDAY}\\b`, 'i'), read: (found, today, later) => namedWeekday(weekdayIn(found[3]!), found[2], today, later) },
  { pattern: new RegExp(`\\b(on|by|due|before|next|this)\\s+${WEEKDAY}\\b`, 'i'), read: (found, today, later) => namedWeekday(weekdayIn(found[2]!), found[1], today, later) },
  { pattern: new RegExp(`\\b(by|before|in|until)\\s+${MONTH}\\b`, 'i'), read: (found, today) => dated(monthOf(found[2]!), 1, null, today) },
  { pattern: new RegExp(`\\b${DUE}the\\s+${ORDINAL}\\b`, 'i'), read: (found, today) => nextDate(Number(found[2]), today) },
];

function numericDate(text: Phrase, today: Day, dayFirst: boolean): { day: Day; limit: boolean } | null {
  const found = text.take(new RegExp(`\\b${DUE}(\\d{1,2})[/.](\\d{1,2})(?:[/.](\\d{2,4}))?\\b(?!\\s*(?:am|pm))`, 'i'));
  if (!found) return null;
  const [first, second] = [Number(found[2]), Number(found[3])];
  const monthFirst = second > 12 || (!dayFirst && first <= 12);
  const [date, month] = monthFirst ? [second, first] : [first, second];
  return { day: dated(month, date, fullYear(found[4]), today), limit: isLimit(found[1]) };
}

function relative(text: Phrase, now: number): Found | null {
  if (text.take(/\b(?:in\s+)?half\s+an\s+hour\b/i)) return fromInstant(now + 30 * MINUTE_MS);
  const found = text.take(new RegExp(`\\bin\\s+${COUNT}\\s+(min(?:ute)?|hour|hr|day|week|month|year)s?\\b`, 'i'));
  if (!found) return null;
  const count = countOf(found[1]!);
  const today = dayOf(now);
  const { year, month, day } = partsOf(today);
  switch (found[2]!.toLowerCase().slice(0, 2)) {
    case 'mi': return fromInstant(now + count * MINUTE_MS);
    case 'ho':
    case 'hr': return fromInstant(now + count * HOUR_MS);
    case 'da': return { day: addDays(today, count), time: null, deadline: false };
    case 'we': return { day: addDays(today, count * 7), time: null, deadline: false };
    case 'mo': return { day: makeDay(year, month + count, day), time: null, deadline: false };
    default: return { day: makeDay(year + count, month, day), time: null, deadline: false };
  }
}

function fromInstant(at: number): Found {
  const rounded = new Date(Math.round(at / MINUTE_MS) * MINUTE_MS);
  return { day: dayOf(rounded.getTime()), time: clock(rounded.getHours(), rounded.getMinutes()), deadline: false };
}

function hours(written: number, meridiem: string | undefined): number {
  if (!meridiem) return written;
  const pm = meridiem.toLowerCase() === 'pm';
  return written % 12 + (pm ? 12 : 0);
}

/** Takes a time of day out of the text. An hour with no am or pm is a working hour, so "at 3" is in the afternoon. */
function readTime(text: Phrase): string | null {
  const exact = text.take(/\b(?:at\s+)?(\d{1,2}):(\d{2})\s*(am|pm)?\b/i) ?? text.take(/\bat\s+(\d{1,2})\.(\d{2})\s*(am|pm)?\b/i) ??
    text.take(/\b(\d{1,2})\.(\d{2})\s*(am|pm)\b/i);
  if (exact) return clock(hours(Number(exact[1]), exact[3]), Number(exact[2]));
  const whole = text.take(/\b(?:at\s+)?(\d{1,2})\s*(am|pm)\b/i);
  if (whole) return clock(hours(Number(whole[1]), whole[2]), 0);
  const bare = text.take(/\bat\s+(\d{1,2})\b/i);
  if (bare) {
    const hour = Number(bare[1]);
    return clock(hour >= 1 && hour <= 7 ? hour + 12 : hour, 0);
  }
  const word = text.take(/\b(?:at\s+|in\s+the\s+|this\s+)?(noon|midday|lunchtime|midnight|morning|afternoon|evening|tonight)\b/i);
  return word ? WHOLE_DAY_WORDS[word[1]!.toLowerCase()]! : null;
}

/** Takes a date and a time of day out of the text. */
export function readMoment(text: Phrase, now: number, dayFirst: boolean): Found {
  const moved = relative(text, now);
  if (moved) return moved;
  const today = dayOf(now);
  const time = readTime(text);
  const numeric = numericDate(text, today, dayFirst);
  if (numeric) return { day: numeric.day, time, deadline: numeric.limit };
  const later = !time || new Date(now).toTimeString().slice(0, 5) < time;
  for (const { pattern, read } of DATE_RULES) {
    const found = text.take(pattern);
    if (found) return { day: read(found, today, later), time, deadline: isLimit(found[1]) };
  }
  return { day: null, time, deadline: false };
}
