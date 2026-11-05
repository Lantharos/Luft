import { addDays, dayOf, partsOf } from '../model/days.js';
import { firstFrom } from '../model/repeats.js';
import type { Kind, Repeat, When } from '../model/types.js';
import { readMoment } from './moment.js';
import { Phrase } from './phrase.js';
import { readRepeat } from './repeat.js';
import { COUNT, countOf } from './words.js';

export interface Parsed {
  title: string;
  kind: Kind;
  when: When | null;
  repeat: Repeat | null;
  /** Days of heads-up asked for in the text, or `null` when it doesn't say. */
  headsUp: number | null;
  /** Whether the text clearly asks for a reminder, so search can offer to add one. */
  asked: boolean;
}

const ASKING = /^\s*(?:remind\s+me\s+(?:to|about|of)?|reminder\s*:?|remember\s+to|don['’]?t\s+forget(?:\s+to)?|to-?\s?do\s*:?|task\s*:?)\s*/i;
const GOAL = /^\s*(?:goal|deadline)\s*:?\s+/i;
const YEARLY_DAY = /\b(?:birthday|bday|b-day|anniversary)\b/i;
const HEADS_UP = new RegExp(`\\b(?:(?:remind\\s+me|tell\\s+me|warn\\s+me|with|and)\\s+)?${COUNT}\\s+(day|week)s?(?:['’]s?)?\\s+(?:before|ahead|notice|in\\s+advance)\\b`, 'i');
const DANGLING = /^(?:[\s,;:–—-]|(?:on|at|in|by|for|due|every|each|of|and)\b)+|(?:[\s,;:–—-]|\b(?:on|at|in|by|for|due|the|every|each|of|and))+$/gi;

function readHeadsUp(text: Phrase): number | null {
  const found = text.take(HEADS_UP);
  return found ? countOf(found[1]!) * (found[2]!.toLowerCase() === 'week' ? 7 : 1) : null;
}

/** Where a repeat with no date of its own starts: today if the time is still ahead, otherwise the first day after. */
function firstDay(repeat: Repeat, time: string | null, now: number) {
  const today = dayOf(now);
  const passed = !!time && new Date(now).toTimeString().slice(0, 5) >= time;
  return firstFrom(repeat, passed ? addDays(today, 1) : today);
}

function settled(repeat: Repeat | null, when: When | null): Repeat | null {
  if (!repeat || !when) return repeat;
  const { day } = partsOf(when.day);
  return (repeat.unit === 'month' && !repeat.nth) || repeat.unit === 'year' ? { ...repeat, date: repeat.date ?? day } : repeat;
}

function kindOf(title: string, deadline: boolean, goal: boolean): Kind {
  if (YEARLY_DAY.test(title)) return 'birthday';
  return goal || deadline ? 'goal' : 'reminder';
}

const titleOf = (rest: string) => {
  const title = rest.replace(/\s+/g, ' ').replace(DANGLING, '').trim();
  return title.charAt(0).toUpperCase() + title.slice(1);
};

/** Reads natural English such as "pay rent every month on the 1st" into a reminder. What it can't place stays in the title. */
export function parse(text: string, now: number, dayFirst: boolean): Parsed {
  const reading = new Phrase(text);
  const asked = !!reading.take(ASKING);
  const goal = !!reading.take(GOAL);
  const headsUp = readHeadsUp(reading);
  let repeat = readRepeat(reading);
  const { day, time, deadline } = readMoment(reading, now, dayFirst);
  const title = titleOf(reading.rest);
  const kind = kindOf(title, deadline, goal);
  if (kind === 'birthday' && day && !repeat) repeat = { unit: 'year', every: 1 };
  const start = day ?? (repeat ? firstDay(repeat, time, now) : time ? (new Date(now).toTimeString().slice(0, 5) < time ? dayOf(now) : addDays(dayOf(now), 1)) : null);
  const when = start ? { day: start, time } : null;
  return { title, kind, when, repeat: settled(repeat, when), headsUp, asked: asked || goal };
}
