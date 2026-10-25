import { describe, expect, test } from 'bun:test';

import { Strip } from './strip.js';

const VIEW = { x: 0, y: 0, width: 1000, height: 600 };

function strip(columns: number): Strip<string> {
  const strip = new Strip<string>();
  strip.setView(VIEW, 0);
  for (let index = 0; index < columns; index++) strip.add(`window ${index}`, false);
  return strip;
}

describe('snapping after a swipe', () => {
  test('never scrolls past the start of the strip', () => {
    const snap = strip(3).snap(-400);
    expect(snap.offset).toBe(0);
    expect(snap.column).toBe(0);
  });

  test('never scrolls past the end of the strip', () => {
    const columns = strip(3);
    const furthest = columns.totalWidth - columns.viewWidth;
    expect(columns.snap(furthest + 400).offset).toBe(furthest);
  });

  test('a strip narrower than the view stays at its start', () => {
    expect(strip(1).snap(-200).offset).toBe(0);
    expect(strip(1).snap(200).offset).toBe(0);
  });

  test('lands on the nearest column edge in between', () => {
    const columns = strip(4);
    const second = columns.columnStart(1);
    expect(columns.snap(second + 20)).toEqual({ offset: second, column: 1 });
  });
});

describe('column widths', () => {
  test('maximizing fills the view and maximizing again gives the width back', () => {
    const columns = strip(2);
    columns.focused = 0;
    columns.maximize();
    expect(columns.columnWidth(columns.columns[0]!)).toBe(columns.viewWidth);
    columns.maximize();
    expect(columns.columns[0]!.width).toBe(1 / 2);
  });

  test('expanding fills what the column beside it leaves', () => {
    const columns = new Strip<string>();
    columns.setView({ x: 0, y: 0, width: 1000, height: 600 }, 10);
    columns.add('third', false);
    columns.add('half', false);
    columns.columns[0]!.width = 1 / 3;
    columns.focused = 1;
    columns.offset = 0;
    columns.expand();
    const [first, second] = columns.columns;
    expect(columns.columnWidth(first!) + 10 + columns.columnWidth(second!)).toBeCloseTo(columns.viewWidth, -1);
    expect(columns.offset).toBe(0);
  });

  test('moving a column to the ends of the strip', () => {
    const columns = strip(3);
    columns.focused = 1;
    expect(columns.moveColumnToEdge(false)).toBe(true);
    expect(columns.edge(false)).toBe('window 1');
    expect(columns.focused).toBe(0);
    expect(columns.moveColumnToEdge(true)).toBe(true);
    expect(columns.edge(true)).toBe('window 1');
    expect(columns.moveColumnToEdge(true)).toBe(false);
  });
});
