import { evaluate } from '../calculator/expression.js';
import { addDays, addMonths, dayNumber, instantOf, parts, wallClock, type Day, type Parts } from './calendar.js';
import { lexicon, lexiconSteps, parseDate, resolve, type DateSpec, type Lexicon } from './dates.js';
import { count, Cursor, fold, tokenize } from './text.js';
import {
  AFTER, AGO, AGO_BEFORE, AND, AT_PLACE, BEFORE, BETWEEN, FILLERS, HOLIDAYS, INTO_PLACE, MIDNIGHT, NOON, NUMBER_WORDS, OF_WORDS, PAST_HINTS,
  PERCENT_WORDS, RANGE_END, RANGE_START, SINCE, TIME_WORDS, TODAY, UNTIL, WEEKDAY_WORDS, WITHIN, type SpanUnit, type Unit,
} from './vocabulary.js';
import { abbreviation, parseClock, parsePlace, placeIndex, type Place } from './zones.js';

export interface Location {
  zone: string;
  place: string;
}

export type Answer =
  | { kind: 'span'; direction: 'until' | 'since' | 'between'; unit: SpanUnit; parts: Parts; from: Day; to: Day }
  | { kind: 'date'; date: Day; days: number }
  | { kind: 'time'; instant: number; at: Location; from: Location | null }
  | { kind: 'number'; value: number; percent: boolean };

export interface AnswerContext {
  locale: string;
  now: number;
  zone: string;
}

interface Scope {
  words: Lexicon;
  today: Day;
  context: AnswerContext;
  original: string[];
  past: boolean;
}

const SPAN_UNITS = new Set<Unit>(['days', 'weeks', 'months', 'years']);
const MINUTES: Partial<Record<Unit, number>> = { minutes: 1, hours: 60 };
const NUMBER = '(\\d+(?:[.,]\\d+)?)';
const PERCENT = `(?:${PERCENT_WORDS}|%)`;
const PERCENT_QUESTIONS: [RegExp, 'part-whole' | 'whole-part'][] = [
  [`(?:what )?${PERCENT} of ${NUMBER} is ${NUMBER}`, 'whole-part'],
  [`${NUMBER} is what ${PERCENT} of ${NUMBER}`, 'part-whole'],
  [`${NUMBER} (?:of|out of) ${NUMBER} (?:in|as) (?:a )?${PERCENT}`, 'part-whole'],
  [`${NUMBER} as (?:a )?${PERCENT} of ${NUMBER}`, 'part-whole'],
  [`wie ?viele? ${PERCENT} (?:sind|ist|macht|machen) ${NUMBER} von ${NUMBER}`, 'part-whole'],
  [`${NUMBER} von ${NUMBER} in ${PERCENT}`, 'part-whole'],
  [`sa ${PERCENT} (?:eshte|jane|bejne|ben) ${NUMBER} (?:nga|e|prej) ${NUMBER}`, 'part-whole'],
  [`koliko ${PERCENT} (?:je|su|iznosi|cini) ${NUMBER} od ${NUMBER}`, 'part-whole'],
  [`${NUMBER} od ${NUMBER} u ${PERCENT}`, 'part-whole'],
].map(([pattern, order]) => [new RegExp(`^${pattern}$`), order as 'part-whole' | 'whole-part']);

const CUES = new Set([...TIME_WORDS, ...UNTIL, ...SINCE, ...BETWEEN, ...RANGE_START, ...NOON, ...MIDNIGHT, ...NUMBER_WORDS.keys(),
  ...HOLIDAYS.map(([words]) => words[0])]);

const asksSomething = (tokens: string[], words: Lexicon) =>
  tokens.some(token => /\d/.test(token) || CUES.has(token) || words.relativeDays.has(token));

const calendarDay = ({ year, month, day }: Day): Day => ({ year, month, day });
const number = (text: string) => Number(text.replace(',', '.'));

function percentage(folded: string): Answer | null {
  for (const [pattern, order] of PERCENT_QUESTIONS) {
    const match = folded.match(pattern);
    if (!match) continue;
    const [part, whole] = order === 'part-whole' ? [match[1], match[2]] : [match[2], match[1]];
    return number(whole) === 0 ? null : { kind: 'number', value: number(part) / number(whole) * 100, percent: true };
  }
  return null;
}

function calculation(folded: string): Answer | null {
  let rest = folded;
  for (let leading = rest.match(/^([\p{L}']+)\s+/u); leading && FILLERS.has(leading[1]); leading = rest.match(/^([\p{L}']+)\s+/u))
    rest = rest.slice(leading[0].length);
  const expression = rest.replace(/[\p{L}']+/gu, word => OF_WORDS.has(word) ? 'of' : word);
  if (expression === folded) return null;
  const value = evaluate(expression, true);
  return value === null ? null : { kind: 'number', value, percent: false };
}

function whole<T>(tokens: string[], parse: (cursor: Cursor) => T | null): T | null {
  const cursor = new Cursor(tokens);
  const parsed = parse(cursor);
  return parsed !== null && cursor.done ? parsed : null;
}

function display(place: Place | null, cursor: Cursor, scope: Scope, start: number): string {
  if (!place) return '';
  const typed = scope.original.slice(start, start + place.words);
  if (place.words === 1 && abbreviation(cursor.tokens[start])) return typed[0].toLocaleUpperCase(scope.context.locale);
  return typed.map(word => word.charAt(0).toLocaleUpperCase(scope.context.locale) + word.slice(1)).join(' ');
}

function located(cursor: Cursor, scope: Scope): Location | null {
  const start = cursor.at;
  const place = cursor.attempt(parsePlace);
  return place ? { zone: place.zone, place: display(place, cursor, scope, start) } : null;
}

const here = (scope: Scope): Location => ({ zone: scope.context.zone, place: '' });

function currentTime(cursor: Cursor, scope: Scope): Answer | null {
  const asked = !!cursor.word(TIME_WORDS);
  cursor.word(AT_PLACE);
  const at = located(cursor, scope);
  if (!at || !(asked || cursor.word(TIME_WORDS))) return null;
  return { kind: 'time', instant: scope.context.now, at, from: null };
}

function convertedTime(cursor: Cursor, scope: Scope): Answer | null {
  const leading = located(cursor, scope);
  const clock = parseClock(cursor);
  if (!clock) return null;
  const source = leading ?? located(cursor, scope);
  cursor.word(TIME_WORDS);
  const target = cursor.word(INTO_PLACE) ? located(cursor, scope) : null;
  if (!source && !target) return null;
  const from = source ?? here(scope);
  const day = wallClock(scope.context.now, from.zone);
  return { kind: 'time', instant: instantOf(day, clock.hour, clock.minute, from.zone), at: target ?? here(scope), from };
}

function spanUnit(cursor: Cursor, scope: Scope): SpanUnit | null {
  const unit = scope.words.units.get(cursor.peek() ?? '');
  if (!unit || !SPAN_UNITS.has(unit)) return null;
  cursor.at++;
  return unit as SpanUnit;
}

function date(cursor: Cursor, scope: Scope): DateSpec | null {
  return parseDate(cursor, scope.words);
}

function pair(first: DateSpec, second: DateSpec, today: Day): [Day, Day] | null {
  const year = (spec: DateSpec) => spec.kind === 'day' ? spec.year : undefined;
  const firstSpec = first.kind === 'day' && first.year === undefined && year(second) !== undefined ? { ...first, year: year(second) } : first;
  const from = resolve(firstSpec, today, 'this');
  let to = resolve(second, from ?? today, 'this');
  if (from && to && second.kind === 'day' && second.year === undefined && dayNumber(to) < dayNumber(from)) to = { ...to, year: to.year + 1 };
  return from && to ? [from, to] : null;
}

function spanAnswer(direction: 'until' | 'since' | 'between', unit: SpanUnit, from: Day, to: Day): Answer {
  const turned = direction !== 'between' && dayNumber(to) < dayNumber(from);
  if (!turned) return { kind: 'span', direction, unit, parts: parts(from, to, unit), from, to };
  return { kind: 'span', direction: direction === 'until' ? 'since' : 'until', unit, parts: parts(to, from, unit), from: to, to: from };
}

function span(cursor: Cursor, scope: Scope): Answer | null {
  const unit = spanUnit(cursor, scope) ?? 'days';
  const { today } = scope;
  if (cursor.word(UNTIL)) {
    const spec = date(cursor, scope);
    const to = spec && resolve(spec, today, 'future');
    return to ? spanAnswer('until', unit, today, to) : null;
  }
  const range = cursor.attempt(current => {
    if (!current.word(BETWEEN) && !current.word(RANGE_START)) return null;
    const first = date(current, scope);
    if (!first || !(current.word(AND) || current.word(RANGE_END))) return null;
    const second = date(current, scope);
    return second && pair(first, second, today);
  });
  if (range) return spanAnswer('between', unit, ...range);
  if (!cursor.word(SINCE)) return null;
  const spec = date(cursor, scope);
  const from = spec && resolve(spec, today, 'past');
  return from ? spanAnswer('since', unit, from, today) : null;
}

function counted(cursor: Cursor, scope: Scope): { amount: number; unit: Unit } | null {
  const amount = count(cursor.take(), NUMBER_WORDS);
  const unit = scope.words.units.get(cursor.take() ?? '');
  return amount !== null && unit ? { amount, unit } : null;
}

function shifted(base: Day | null, amount: number, unit: Unit, scope: Scope): Answer | null {
  const minutes = MINUTES[unit];
  if (minutes) return base ? null : { kind: 'time', instant: scope.context.now + amount * minutes * 60_000, at: here(scope), from: null };
  const start = base ?? scope.today;
  const whole = Number.isInteger(amount);
  const target = unit === 'days' ? addDays(start, Math.round(amount))
    : unit === 'weeks' ? addDays(start, Math.round(amount * 7))
    : whole ? addMonths(start, amount * (unit === 'years' ? 12 : 1)) : null;
  return target && { kind: 'date', date: target, days: dayNumber(target) - dayNumber(scope.today) };
}

function offset(cursor: Cursor, scope: Scope): Answer | null {
  const sign = cursor.word(WITHIN) ? 1 : cursor.word(AGO_BEFORE) ? -1 : 0;
  const amount = counted(cursor, scope);
  if (!amount) return null;
  if (sign) return shifted(null, sign * amount.amount, amount.unit, scope);
  if (cursor.word(AGO)) return shifted(null, -amount.amount, amount.unit, scope);
  const direction = cursor.word(AFTER) ? 1 : cursor.word(BEFORE) ? -1 : 0;
  if (!direction) return null;
  if (cursor.word(TODAY)) return shifted(null, direction * amount.amount, amount.unit, scope);
  const spec = date(cursor, scope);
  const base = spec && resolve(spec, scope.today, 'future');
  return base ? shifted(base, direction * amount.amount, amount.unit, scope) : null;
}

function template(tokens: string[], scope: Scope): Answer | null {
  const canonical = (token: string) => scope.words.units.has(token) ? `@${scope.words.units.get(token)}` : token;
  for (const { before, after, unit, sign } of scope.words.templates) {
    if (tokens.length !== before.length + 1 + after.length) continue;
    const amount = count(tokens[before.length], NUMBER_WORDS);
    const matches = (expected: string[], offsetBy: number) => expected.every((word, index) => canonical(word) === canonical(tokens[offsetBy + index]));
    const unitMatches = [...before, ...after].some(word => canonical(word) === `@${unit}`);
    if (amount !== null && unitMatches && matches(before, 0) && matches(after, before.length + 1)) return shifted(null, sign * amount, unit, scope);
  }
  return null;
}

function day(cursor: Cursor, scope: Scope): Answer | null {
  const asked = !!cursor.word(WEEKDAY_WORDS) || !!cursor.attempt(current => spanUnit(current, scope) === 'days' ? true : null);
  const spec = date(cursor, scope);
  if (!spec || (!asked && spec.kind === 'weekday')) return null;
  const found = resolve(spec, scope.today, scope.past ? 'past' : 'future');
  return found && { kind: 'date', date: found, days: dayNumber(found) - dayNumber(scope.today) };
}

export function answerSteps(locale: string): (() => void)[] {
  return [...lexiconSteps(locale), () => placeIndex()];
}

export function answer(text: string, context: AnswerContext): Answer | null {
  const folded = fold(text).replace(/[?!]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!folded) return null;
  const percent = percentage(folded);
  if (percent) return percent;
  const tokenized = tokenize(text);
  const kept = tokenized.folded.flatMap((token, index) => FILLERS.has(token) ? [] : [index]);
  const tokens = kept.map(index => tokenized.folded[index]);
  const words = lexicon(context.locale);
  if (!asksSomething(tokens, words)) return null;
  const scope: Scope = {
    words,
    today: calendarDay(wallClock(context.now, context.zone)),
    context,
    original: kept.map(index => tokenized.original[index]),
    past: tokenized.folded.some(token => PAST_HINTS.has(token)),
  };
  return whole(tokens, cursor => currentTime(cursor, scope))
    ?? whole(tokens, cursor => convertedTime(cursor, scope))
    ?? whole(tokens, cursor => span(cursor, scope))
    ?? whole(tokens, cursor => offset(cursor, scope))
    ?? template(tokens, scope)
    ?? whole(tokens, cursor => day(cursor, scope))
    ?? calculation(folded);
}
