import { describe, expect, test } from 'bun:test';

import {
  completeArrangement, DEFAULT_ARRANGEMENT, fromEdgeAndAlignment, joinedGroups, layIslands, mainEdge, moveBar, moveElement, moveIsland,
  parseArrangement, presetArrangement, spotTargets, stepElement, stepIsland, storeArrangement, type Arrangement, type IslandFrame, type Spot,
} from '../../../../../../packages/web/ui/src/taskbar/arrangement/index';

const FRAME: IslandFrame = { width: 1440, height: 900, thickness: 48, margin: 8, rightToLeft: false };
const boxAt = (boxes: ReturnType<typeof layIslands>, spot: Spot) => boxes.find(box => box.spot === spot)!;
const overlap = (a: { x: number; y: number; width: number; height: number }, b: typeof a) =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

describe('reading a stored arrangement', () => {
  test('keeps each element in the first island that names it and drops unknown spots and empty islands', () => {
    expect(parseArrangement([['bottom-center', ['start', 'dock']], ['middle', ['tray']], ['top-end', ['dock', 'clock']], ['left-start', []]]))
      .toEqual([{ spot: 'bottom-center', elements: ['start', 'dock'] }, { spot: 'top-end', elements: ['clock'] }]);
  });

  test('merges islands stored twice at one spot', () => {
    expect(parseArrangement([['bottom-end', ['tray']], ['bottom-end', ['clock']]])).toEqual([{ spot: 'bottom-end', elements: ['tray', 'clock'] }]);
  });

  test('stores and reads back the same arrangement', () => {
    const arrangement: Arrangement = [{ spot: 'left-center', elements: ['start', 'dock'] }, { spot: 'top-end', elements: ['tray', 'status', 'clock'] }];
    expect(parseArrangement(storeArrangement(arrangement))).toEqual(arrangement);
  });
});

describe('carrying over the edge and alignment people chose before', () => {
  test('a left-aligned taskbar on the right edge keeps Start and the apps at its top and the clock at its bottom', () => {
    expect(fromEdgeAndAlignment('right', 'left')).toEqual([
      { spot: 'right-start', elements: ['start', 'dock'] },
      { spot: 'right-end', elements: ['tray', 'status', 'clock'] },
    ]);
  });

  test('the centred taskbar at the bottom is the default arrangement', () => {
    expect(fromEdgeAndAlignment('bottom', 'center')).toEqual(DEFAULT_ARRANGEMENT);
  });
});

describe('placing elements that are missing', () => {
  test('puts an extension element in front of the tray', () => {
    expect(completeArrangement(DEFAULT_ARRANGEMENT, ['media/now-playing'])[1].elements).toEqual(['media/now-playing', 'tray', 'status', 'clock']);
  });

  test('puts Start back in front of the dock wherever the dock went', () => {
    expect(completeArrangement([{ spot: 'left-center', elements: ['dock'] }], ['start'])).toEqual([{ spot: 'left-center', elements: ['start', 'dock'] }]);
  });

  test('gives an element with no neighbours left an island at its usual spot', () => {
    expect(completeArrangement([{ spot: 'top-center', elements: ['start', 'dock'] }], ['clock'])).toContainEqual({ spot: 'bottom-end', elements: ['clock'] });
  });

  test('a preset keeps extension elements next to the tray', () => {
    const current = completeArrangement(DEFAULT_ARRANGEMENT, ['media/now-playing']);
    expect(presetArrangement('mac', current)).toContainEqual({ spot: 'top-end', elements: ['media/now-playing', 'tray', 'status', 'clock'] });
  });
});

describe('editing', () => {
  test('moving an island onto another one trades their spots', () => {
    expect(moveIsland(DEFAULT_ARRANGEMENT, 'bottom-center', 'bottom-end')).toEqual([
      { spot: 'bottom-end', elements: ['start', 'dock'] },
      { spot: 'bottom-center', elements: ['tray', 'status', 'clock'] },
    ]);
  });

  test('moving Start onto a free spot gives it an island of its own', () => {
    const moved = moveElement(DEFAULT_ARRANGEMENT, 'start', 'bottom-start');
    expect(moved).toContainEqual({ spot: 'bottom-start', elements: ['start'] });
    expect(moved).toContainEqual({ spot: 'bottom-center', elements: ['dock'] });
  });

  test('moving the last element out of an island removes the island', () => {
    const alone = moveElement(DEFAULT_ARRANGEMENT, 'start', 'top-start');
    expect(moveElement(alone, 'start', 'bottom-center', 0)).toEqual([
      { spot: 'bottom-center', elements: ['start', 'dock'] },
      { spot: 'bottom-end', elements: ['tray', 'status', 'clock'] },
    ]);
  });

  test('reorders an element inside its island by its place among the others', () => {
    expect(moveElement(DEFAULT_ARRANGEMENT, 'tray', 'bottom-end', 2)[1].elements).toEqual(['status', 'clock', 'tray']);
    expect(moveElement(DEFAULT_ARRANGEMENT, 'clock', 'bottom-end', 0)[1].elements).toEqual(['clock', 'tray', 'status']);
  });

  test('moving a joined bar to another edge keeps each group where it sits along the bar', () => {
    const groups = [{ spot: 'bottom-start', elements: ['start'] }, { spot: 'bottom-center', elements: ['dock'] }, { spot: 'top-end', elements: ['clock'] }] as Arrangement;
    expect(moveBar(groups, 'left')).toEqual([
      { spot: 'left-start', elements: ['start'] },
      { spot: 'left-center', elements: ['dock'] },
      { spot: 'left-end', elements: ['clock'] },
    ]);
  });

  test('a bar joined from islands on several edges runs along the dock and puts its own edge first', () => {
    const arrangement: Arrangement = [{ spot: 'top-end', elements: ['clock'] }, { spot: 'left-center', elements: ['dock'] }, { spot: 'left-end', elements: ['tray'] }];
    expect(mainEdge(arrangement)).toBe('left');
    expect(joinedGroups(arrangement, 'left')).toEqual({ start: [], center: ['dock'], end: ['tray', 'clock'] });
  });
});

describe('laying out separate islands', () => {
  test('puts islands at the start, middle and end of an edge, a margin from the screen', () => {
    const boxes = layIslands([{ spot: 'bottom-start', length: 100 }, { spot: 'bottom-center', length: 300 }, { spot: 'bottom-end', length: 200 }], FRAME);
    expect(boxAt(boxes, 'bottom-start')).toMatchObject({ x: 8, y: 900 - 8 - 48, width: 100, height: 48 });
    expect(boxAt(boxes, 'bottom-center').x).toBe((1440 - 300) / 2);
    expect(boxAt(boxes, 'bottom-end').x).toBe(1440 - 8 - 200);
  });

  test('keeps a long middle island clear of the islands at the ends', () => {
    const boxes = layIslands([{ spot: 'bottom-start', length: 500 }, { spot: 'bottom-center', length: 600 }], FRAME);
    expect(boxAt(boxes, 'bottom-center').x).toBe(8 + 500 + 8);
  });

  test('mirrors the start and end of the top and bottom for right-to-left languages', () => {
    const boxes = layIslands([{ spot: 'bottom-start', length: 100 }], { ...FRAME, rightToLeft: true });
    expect(boxAt(boxes, 'bottom-start').x).toBe(1440 - 8 - 100);
  });

  test('an island on the side moves up out of a corner the bottom already fills', () => {
    const boxes = layIslands([{ spot: 'bottom-end', length: 200 }, { spot: 'right-end', length: 150 }], FRAME);
    const bottom = boxAt(boxes, 'bottom-end');
    const side = boxAt(boxes, 'right-end');
    expect(overlap(bottom, side)).toBe(false);
    expect(side.y + side.height).toBe(bottom.y - 8);
    expect(side.x).toBe(1440 - 8 - 48);
  });

  test('islands in the same corner with nothing in each other\'s way stay where they are', () => {
    const boxes = layIslands([{ spot: 'bottom-center', length: 400 }, { spot: 'left-end', length: 150 }], FRAME);
    expect(boxAt(boxes, 'left-end').y + 150).toBe(900 - 8);
  });

  test('a long side dock that would reach into a filled corner stays centred in the room left', () => {
    const boxes = layIslands([{ spot: 'left-center', length: 800 }, { spot: 'top-start', length: 100 }], FRAME);
    const side = boxAt(boxes, 'left-center');
    expect(overlap(side, boxAt(boxes, 'top-start'))).toBe(false);
    expect(side.y).toBe((8 + 48 + 8 + 900 - 8 - 800) / 2);
  });
});

describe('arranging with the arrow keys', () => {
  const targets = spotTargets(FRAME, 144);

  test('Up moves an island at the bottom to the top', () => {
    expect(stepIsland(DEFAULT_ARRANGEMENT, 'bottom-center', [0, -1], targets, false)[0].spot).toBe('top-center');
  });

  test('Left and Right move an element along its island', () => {
    expect(stepElement(DEFAULT_ARRANGEMENT, 'status', [1, 0], targets, false, false)[1].elements).toEqual(['tray', 'clock', 'status']);
    expect(stepElement(DEFAULT_ARRANGEMENT, 'status', [1, 0], targets, false, true)[1].elements).toEqual(['status', 'tray', 'clock']);
  });

  test('past the end of its island, an element goes to the next spot that way', () => {
    expect(stepElement(DEFAULT_ARRANGEMENT, 'start', [-1, 0], targets, false, false)).toContainEqual({ spot: 'bottom-start', elements: ['start'] });
  });

  test('on a joined bar, an island moved to another edge takes the whole bar along', () => {
    const moved = stepIsland(DEFAULT_ARRANGEMENT, 'bottom-center', [0, -1], targets, true);
    expect(moved.map(island => island.spot).sort()).toEqual(['top-center', 'top-end']);
  });
});
