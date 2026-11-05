import { type Day, dayOf, makeDay } from '../model/days.js';
import { firstFrom, following } from '../model/repeats.js';
import type { Kind, Repeat, When } from '../model/types.js';
import { property, type Property, unescaped, unfolded } from './lines.js';
import { WEEKDAY_CODES } from './write.js';

const YEARLY_DAY = /\b(?:birthday|anniversary)\b/i;
const UNITS: Record<string, Repeat['unit']> = { DAILY: 'day', WEEKLY: 'week', MONTHLY: 'month', YEARLY: 'year' };
const STAMP = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z?))?$/;
const COMPONENTS_PER_PAUSE = 200;

/** One reminder found in a calendar file. */
export interface Found {
  uid: string | null;
  title: string;
  kind: Kind;
  when: When | null;
  repeat: Repeat | null;
  headsUp: number;
}

export interface Reading {
  found: Found[];
  /** Past events, finished tasks and what a file doesn't describe well enough. */
  skipped: number;
}

function zoneOffset(at: number, zone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }).formatToParts(at);
  const part = (type: string) => Number(parts.find(found => found.type === type)!.value);
  return Date.UTC(part('year'), part('month') - 1, part('day'), part('hour'), part('minute'), part('second')) - Math.floor(at / 1000) * 1000;
}

function inZone(wall: number, zone: string): number | null {
  try {
    return wall - zoneOffset(wall - zoneOffset(wall, zone), zone);
  } catch (error) {
    if (error instanceof RangeError) return null;
    throw error;
  }
}

const localWhen = (at: number): When => ({ day: dayOf(at), time: new Date(at).toTimeString().slice(0, 5) });

/** Local time for a date in a file: as written when it's floating, converted when it names UTC or another zone. */
function whenOf({ value, params }: Property): When | null {
  const stamp = STAMP.exec(value);
  if (!stamp) return null;
  const [, year, month, day, hours, minutes, seconds, utc] = stamp;
  const date = makeDay(Number(year), Number(month), Number(day));
  if (!hours) return { day: date, time: null };
  const wall = Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes), Number(seconds));
  const zone = params.get('TZID');
  const at = utc ? wall : zone ? inZone(wall, zone) : null;
  return at === null ? { day: date, time: `${hours}:${minutes}` } : localWhen(at);
}

function repeatOf(value: string): { repeat: Repeat | null; ended: boolean } {
  const parts = new Map(value.split(';').map(part => part.split('=') as [string, string]));
  const unit = UNITS[parts.get('FREQ') ?? ''];
  if (!unit) return { repeat: null, ended: false };
  const until = parts.get('UNTIL');
  const repeat: Repeat = { unit, every: Number(parts.get('INTERVAL') ?? 1) };
  const byDay = parts.get('BYDAY')?.split(',') ?? [];
  const nth = byDay.length === 1 ? /^(-?\d)([A-Z]{2})$/.exec(byDay[0]!) : null;
  if (nth) repeat.nth = { week: Number(nth[1]), weekday: WEEKDAY_CODES.indexOf(nth[2]!) };
  else if (unit === 'week' && byDay.length) repeat.weekdays = byDay.map(code => WEEKDAY_CODES.indexOf(code));
  const monthDay = parts.get('BYMONTHDAY');
  if (monthDay) repeat.date = Number(monthDay);
  const ended = !!until && whenOf({ name: 'UNTIL', params: new Map(), value: until })!.day < dayOf(Date.now());
  return { repeat, ended };
}

/** Moves a repeat that started long ago up to its next occurrence from today on, without ringing for the ones before. */
function caughtUp(repeat: Repeat, when: When, today: Day): When {
  let day = firstFrom(repeat, when.day);
  while (day < today) day = following(repeat, day);
  return { ...when, day };
}

const daysAhead = (trigger: string) => Number(/^-P(\d+)D/.exec(trigger)?.[1] ?? /^-P(\d+)W/.exec(trigger)?.[1] ?? 0) * (trigger.includes('W') ? 7 : 1);

function kindOf(title: string, props: Map<string, Property>, name: string): Kind {
  const own = props.get('X-LUFT-KIND')?.value;
  if (own === 'reminder' || own === 'birthday' || own === 'goal') return own;
  if (YEARLY_DAY.test(title) || /BIRTHDAY/i.test(props.get('CATEGORIES')?.value ?? '')) return 'birthday';
  return name === 'VTODO' && props.has('DUE') ? 'goal' : 'reminder';
}

function foundIn(name: string, props: Map<string, Property>, headsUp: number, today: Day): Found | null {
  const summary = props.get('SUMMARY');
  if (!summary || props.get('STATUS')?.value === 'COMPLETED' || props.has('COMPLETED') || props.get('STATUS')?.value === 'CANCELLED') return null;
  const title = unescaped(summary.value).trim();
  const start = props.get('DTSTART') ?? props.get('DUE');
  const written = start ? whenOf(start) : null;
  if (start && !written) return null;
  const rule = props.get('RRULE') ? repeatOf(props.get('RRULE')!.value) : { repeat: null, ended: false };
  if (rule.ended) return null;
  const kind = kindOf(title, props, name);
  const repeat = rule.repeat ?? (kind === 'birthday' && written ? { unit: 'year', every: 1 } as const : null);
  const when = written && repeat ? caughtUp(repeat, written, today) : written;
  if (name === 'VEVENT' && when && when.day < today) return null;
  return { uid: props.get('UID')?.value ?? null, title, kind, when, repeat, headsUp };
}

const pause = (wait: () => Promise<void>, count: number) => (count % COMPONENTS_PER_PAUSE ? Promise.resolve() : wait());

/** Reads a calendar file, stopping for `wait` every so often, so a file with years of events doesn't hold up the desktop. */
export async function readCalendar(text: string, now: number, wait: () => Promise<void>): Promise<Reading> {
  const today = dayOf(now);
  const found: Found[] = [];
  let skipped = 0;
  let open: string | null = null;
  let props = new Map<string, Property>();
  let alarm = false;
  let headsUp = 0;
  for (const line of unfolded(text)) {
    const prop = property(line);
    if (prop.name === 'BEGIN' && (prop.value === 'VEVENT' || prop.value === 'VTODO')) {
      open = prop.value;
      props = new Map();
      headsUp = 0;
    } else if (prop.name === 'BEGIN' && prop.value === 'VALARM') {
      alarm = true;
    } else if (prop.name === 'END' && prop.value === 'VALARM') {
      alarm = false;
    } else if (prop.name === 'END' && prop.value === open) {
      const reminder = foundIn(open, props, headsUp, today);
      if (reminder) found.push(reminder);
      else skipped++;
      open = null;
      await pause(wait, found.length + skipped);
    } else if (open && alarm) {
      if (prop.name === 'TRIGGER') headsUp = Math.max(headsUp, daysAhead(prop.value));
    } else if (open && !props.has(prop.name)) {
      props.set(prop.name, prop);
    }
  }
  return { found, skipped };
}
