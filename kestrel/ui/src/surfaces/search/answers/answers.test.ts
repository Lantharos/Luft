import { describe, expect, test } from 'bun:test';

import { answer, type Answer } from './answers.js';
import { wallClock } from './calendar.js';

const NOW = Date.UTC(2026, 9, 21, 10, 0);
const ZONE = 'Europe/Berlin';

const ask = (text: string, locale = 'en') => answer(text, { locale, now: NOW, zone: ZONE });

function span(text: string, locale = 'en'): Extract<Answer, { kind: 'span' }> {
  const found = ask(text, locale);
  if (found?.kind !== 'span') throw new Error(`${text} gave ${JSON.stringify(found)}`);
  return found;
}

function date(text: string, locale = 'en'): Extract<Answer, { kind: 'date' }> {
  const found = ask(text, locale);
  if (found?.kind !== 'date') throw new Error(`${text} gave ${JSON.stringify(found)}`);
  return found;
}

function time(text: string, locale = 'en'): Extract<Answer, { kind: 'time' }> {
  const found = ask(text, locale);
  if (found?.kind !== 'time') throw new Error(`${text} gave ${JSON.stringify(found)}`);
  return found;
}

const clockIn = (found: Extract<Answer, { kind: 'time' }>) => {
  const { hour, minute } = wallClock(found.instant, found.at.zone);
  return `${hour}:${String(minute).padStart(2, '0')}`;
};

describe('spans of days', () => {
  test.each([
    ['how many days until march 27th 2027', 'en'],
    ['days until 27 March 2027', 'en'],
    ['wie viele Tage bis zum 27. März 2027', 'de'],
    ['sa ditë deri më 27 mars 2027', 'sq'],
    ['koliko dana do 27. ožujka 2027.', 'hr'],
    ['koliko dana do 27. marta 2027.', 'bs'],
    ['колико дана до 27. марта 2027.', 'sr'],
  ])('%s', (text, locale) => {
    const found = span(text, locale);
    expect(found.direction).toBe('until');
    expect(found.parts.days).toBe(157);
    expect(found.to).toEqual({ year: 2027, month: 3, day: 27 });
  });

  test.each([
    ['days since 1 jan', 'en'],
    ['Tage seit dem 1. Januar', 'de'],
    ['ditë që nga 1 janari', 'sq'],
    ['dana od 1. siječnja', 'hr'],
  ])('%s', (text, locale) => {
    const found = span(text, locale);
    expect(found.direction).toBe('since');
    expect(found.parts.days).toBe(293);
  });

  test('a year left out means the next one when counting down', () => {
    expect(span('days until 1 jan').to).toEqual({ year: 2027, month: 1, day: 1 });
  });

  test('holidays and weekdays', () => {
    expect(span('how many days until christmas').parts.days).toBe(65);
    expect(span('days until friday').parts.days).toBe(2);
  });

  test('a date that already passed counts back', () => {
    expect(span('days until 1 jan 2026').direction).toBe('since');
  });
});

describe('spans in other units', () => {
  test.each([
    ['weeks between 1 may and 1 sep', 'en'],
    ['how many weeks from 1 may to 1 september', 'en'],
    ['Wochen zwischen dem 1. Mai und dem 1. September', 'de'],
    ['javë midis 1 majit dhe 1 shtatorit', 'sq'],
    ['tjedana između 1. svibnja i 1. rujna', 'hr'],
  ])('%s', (text, locale) => {
    const found = span(text, locale);
    expect(found.direction).toBe('between');
    expect(found.parts).toMatchObject({ weeks: 17, days: 4 });
  });

  test('months and years', () => {
    expect(span('months until 27 march 2027').parts).toMatchObject({ months: 5, days: 6 });
    expect(span('years since 14 feb 2000').parts).toMatchObject({ years: 26, months: 8, days: 7 });
  });
});

describe('dates', () => {
  test.each([
    ['what day is 14 feb 2027', 'en'],
    ['14 February 2027', 'en'],
    ['welcher Tag ist der 14. Februar 2027', 'de'],
    ['koji je dan 14. veljače 2027.', 'hr'],
    ['14.02.2027', 'de'],
    ['2/14/2027', 'en'],
    ['14 février 2027', 'fr'],
  ])('%s', (text, locale) => {
    const found = date(text, locale);
    expect(found.date).toEqual({ year: 2027, month: 2, day: 14 });
    expect(found.days).toBe(116);
  });

  test.each([
    ['3 weeks from today', 'en'],
    ['in 3 weeks', 'en'],
    ['three weeks from now', 'en'],
    ['in 3 Wochen', 'de'],
    ['3 javë nga sot', 'sq'],
    ['za 3 tjedna', 'hr'],
    ['3 tjedna od danas', 'hr'],
    ['dans 3 semaines', 'fr'],
    ['tra 3 settimane', 'it'],
  ])('%s', (text, locale) => {
    expect(date(text, locale).date).toEqual({ year: 2026, month: 11, day: 11 });
  });

  test.each([
    ['10 days ago', 'en'],
    ['vor 10 Tagen', 'de'],
    ['10 ditë më parë', 'sq'],
    ['prije 10 dana', 'hr'],
    ['pre 10 dana', 'sr-Latn'],
  ])('%s', (text, locale) => {
    expect(date(text, locale).date).toEqual({ year: 2026, month: 10, day: 11 });
  });

  test('offsets from another date', () => {
    expect(date('2 months after 31 jan 2027').date).toEqual({ year: 2027, month: 3, day: 31 });
    expect(date('1 month after 31 jan 2027').date).toEqual({ year: 2027, month: 2, day: 28 });
    expect(date('10 days before christmas').date).toEqual({ year: 2026, month: 12, day: 15 });
  });

  test('words for today', () => {
    expect(date('tomorrow').days).toBe(1);
    expect(date('übermorgen', 'de').days).toBe(2);
    expect(date('what day was 1 jan').date).toEqual({ year: 2026, month: 1, day: 1 });
  });
});

describe('time zones', () => {
  test.each([
    ['time in tokyo', 'en', 'Tokyo'],
    ['what time is it in Tokyo', 'en', 'Tokyo'],
    ['tokyo time', 'en', 'Tokyo'],
    ['wie spät ist es in Tokio', 'de', 'Tokio'],
    ['ora në Tokio', 'sq', 'Tokio'],
    ['koliko je sati u Tokiju', 'hr', 'Tokiju'],
    ['време у Токију', 'sr', 'Токију'],
  ])('%s', (text, locale, place) => {
    const found = time(text, locale);
    expect(found.at).toEqual({ zone: 'Asia/Tokyo', place });
    expect(found.instant).toBe(NOW);
    expect(clockIn(found)).toBe('19:00');
  });

  test('a time in one city in another', () => {
    const found = time('10pm london in new york');
    expect(found.from).toEqual({ zone: 'Europe/London', place: 'London' });
    expect(found.at).toEqual({ zone: 'America/New_York', place: 'New York' });
    expect(clockIn(found)).toBe('17:00');
  });

  test('a local time somewhere else, and the other way around', () => {
    expect(clockIn(time('10pm in tokyo'))).toBe('5:00');
    const there = time('9:30 tokyo');
    expect(there.at.zone).toBe(ZONE);
    expect(clockIn(there)).toBe('2:30');
    expect(clockIn(time('15:00 est in cet'))).toBe('21:00');
    expect(time('3pm pst to utc').from?.place).toBe('PST');
  });

  test('hours from now', () => {
    expect(time('in 3 hours').instant).toBe(NOW + 3 * 3_600_000);
  });
});

describe('numbers', () => {
  test.each([
    ['what is 25% of 340', 85],
    ['was ist 25% von 340', 85],
    ['17 is what percent of 340', 5],
    ['what percent of 340 is 17', 5],
    ['wie viel Prozent sind 17 von 340', 5],
    ['koliko posto je 17 od 340', 5],
  ])('%s', (text, value) => {
    const found = ask(text);
    expect(found?.kind).toBe('number');
    expect(found?.kind === 'number' && found.value).toBeCloseTo(value);
  });
});

describe('everything else', () => {
  test.each(['firefox', 'settings', '3 days', '27', 'tokyo', 'friday', 'time', 'days', 'until', 'march', '25% of 340', 'new'])('%s', text => {
    expect(ask(text)).toBeNull();
  });
});
