import { describe, expect, test } from 'bun:test';

import { parse } from '../src/parse/parse.js';

const NOW = new Date(2026, 10, 5, 12, 0).getTime();
const read = (text: string, dayFirst = true) => parse(text, NOW, dayFirst);

describe('dates and times', () => {
  const cases: [string, string, string, string | null][] = [
    ['dentist tuesday 3pm', 'Dentist', '2026-11-10', '15:00'],
    ['call bob tomorrow at 9', 'Call bob', '2026-11-06', '09:00'],
    ['call bob tomorrow at 3', 'Call bob', '2026-11-06', '15:00'],
    ['lunch with ana at noon today', 'Lunch with ana', '2026-11-05', '12:00'],
    ['book flights next friday', 'Book flights', '2026-11-13', null],
    ['book flights friday', 'Book flights', '2026-11-06', null],
    ['tea at 14:30', 'Tea', '2026-11-05', '14:30'],
    ['tea at 9:15 pm', 'Tea', '2026-11-05', '21:15'],
    ['tea at 8am', 'Tea', '2026-11-06', '08:00'],
    ['renew passport 3 march 2027', 'Renew passport', '2027-03-03', null],
    ['renew passport on 3rd of march', 'Renew passport', '2027-03-03', null],
    ['renew passport march 3', 'Renew passport', '2027-03-03', null],
    ['renew passport dec 3rd, 2026', 'Renew passport', '2026-12-03', null],
    ['renew passport 2027-01-02', 'Renew passport', '2027-01-02', null],
    ['renew passport 24/12', 'Renew passport', '2026-12-24', null],
    ['stretch in 30 minutes', 'Stretch', '2026-11-05', '12:30'],
    ['stretch in 2 hours', 'Stretch', '2026-11-05', '14:00'],
    ['stretch in an hour', 'Stretch', '2026-11-05', '13:00'],
    ['stretch in half an hour', 'Stretch', '2026-11-05', '12:30'],
    ['oil change in 3 weeks', 'Oil change', '2026-11-26', null],
    ['oil change next month', 'Oil change', '2026-12-05', null],
    ['pay invoice the 20th', 'Pay invoice', '2026-11-20', null],
    ['pay invoice the 2nd', 'Pay invoice', '2026-12-02', null],
    ['film tonight', 'Film', '2026-11-05', '20:00'],
    ['run this weekend', 'Run', '2026-11-07', null],
  ];
  test.each(cases)('%s', (text, title, day, time) => {
    const parsed = read(text);
    expect(parsed.title).toBe(title);
    expect(parsed.when).toEqual({ day, time });
  });

  test('a time already past today means tomorrow', () => {
    expect(read('tea at 8am').when?.day).toBe('2026-11-06');
  });

  test("today's weekday with a time still ahead is today", () => {
    expect(read('standup thursday 3pm').when?.day).toBe('2026-11-05');
    expect(read('standup thursday 9am').when?.day).toBe('2026-11-12');
  });

  test('numbers in a title stay in the title', () => {
    expect(read('buy 3 lemons').title).toBe('Buy 3 lemons');
    expect(read('buy 3 lemons').when).toBeNull();
  });

  test('month first where people write it so', () => {
    expect(read('party 12/24', false).when?.day).toBe('2026-12-24');
    expect(read('party 3/4', false).when?.day).toBe('2027-03-04');
  });

  test('a word that only looks like a date stays', () => {
    expect(read('march on washington').title).toBe('March on washington');
    expect(read('sat nav repair').title).toBe('Sat nav repair');
  });
});

describe('repeats', () => {
  test('a birthday is yearly by itself', () => {
    const parsed = read("mum's birthday 14 march every year");
    expect(parsed).toMatchObject({ title: "Mum's birthday", kind: 'birthday', when: { day: '2027-03-14', time: null }, repeat: { unit: 'year', every: 1, date: 14 } });
    expect(read('anniversary 2 june').repeat?.unit).toBe('year');
  });

  test('monthly on a date', () => {
    for (const text of ['pay rent every month on the 1st', 'pay rent on the 1st of every month', 'pay rent every 1st', 'pay rent monthly on the 1st'])
      expect(read(text)).toMatchObject({ title: 'Pay rent', when: { day: '2026-12-01' }, repeat: { unit: 'month', every: 1, date: 1 } });
  });

  test('weekdays and lists of them', () => {
    expect(read('standup every weekday at 9')).toMatchObject({ title: 'Standup', when: { day: '2026-11-06', time: '09:00' }, repeat: { unit: 'week', weekdays: [1, 2, 3, 4, 5] } });
    expect(read('gym every monday and thursday 7pm')).toMatchObject({ title: 'Gym', when: { day: '2026-11-05', time: '19:00' }, repeat: { weekdays: [1, 4] } });
    expect(read('bins on tuesdays')).toMatchObject({ title: 'Bins', when: { day: '2026-11-10' }, repeat: { weekdays: [2] } });
  });

  test('every few of something', () => {
    expect(read('water plants every 3 days').repeat).toEqual({ unit: 'day', every: 3 });
    expect(read('payroll every other week').repeat).toEqual({ unit: 'week', every: 2 });
    expect(read('vitamins daily').repeat).toEqual({ unit: 'day', every: 1 });
  });

  test('a weekday of the month', () => {
    expect(read('review the first monday of every month')).toMatchObject({ title: 'Review', when: { day: '2026-12-07' }, repeat: { unit: 'month', nth: { week: 1, weekday: 1 } } });
    expect(read('bookclub every last friday')).toMatchObject({ when: { day: '2026-11-27' }, repeat: { nth: { week: -1, weekday: 5 } } });
  });

  test('every date of a year', () => {
    expect(read('tax every 31 january')).toMatchObject({ title: 'Tax', when: { day: '2027-01-31' }, repeat: { unit: 'year', date: 31 } });
  });
});

describe('kinds', () => {
  test('a deadline makes a goal', () => {
    expect(read('finish thesis by 1 december')).toMatchObject({ title: 'Finish thesis', kind: 'goal', when: { day: '2026-12-01' } });
    expect(read('goal: run a marathon by june')).toMatchObject({ title: 'Run a marathon', kind: 'goal' });
  });

  test('no date makes a to-do', () => {
    expect(read('buy milk')).toMatchObject({ title: 'Buy milk', kind: 'reminder', when: null, repeat: null, asked: false });
  });

  test('asking in words', () => {
    expect(read('remind me to call the bank')).toMatchObject({ title: 'Call the bank', asked: true });
    expect(read("don't forget the keys")).toMatchObject({ title: 'The keys', asked: true });
  });

  test('a heads-up in words', () => {
    expect(read("dad's birthday 2 may, 3 days before").headsUp).toBe(3);
    expect(read("dad's birthday 2 may, a week ahead").headsUp).toBe(7);
  });
});
