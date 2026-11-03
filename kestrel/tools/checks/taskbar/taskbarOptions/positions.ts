import {alongEdge, arrange, boxOf, taskbarEdge, type Edge} from '../../lib/edge.js';
import {band, captureEdge, edgeGap, eventually, HEIGHTS, panel, primary, require} from './taskbar.js';

const EDGES: Edge[] = ['bottom', 'left', 'top', 'right'];
const FADED = 32;

const along = (edge: Edge) => {
  const expected = band(HEIGHTS.normal, 0, edge);
  const box = boxOf(panel());
  return box.x === expected.x && box.y === expected.y && box.width === expected.width && box.height === expected.height;
};

export async function checkPositions() {
  const start = taskbarEdge();
  const order = [...EDGES.slice(EDGES.indexOf(start) + 1), ...EDGES.slice(0, EDGES.indexOf(start) + 1)];
  for (const edge of order) {
    const frames: number[] = [];
    const sample = global.stage.connect('after-paint', () => { if (along(edge)) frames.push(panel().opacity); });
    try {
      arrange(alongEdge(edge));
      await eventually(() => along(edge) && panel().opacity === 255 && edgeGap(primary()) === HEIGHTS.normal,
        `the taskbar moves to the ${edge} edge and reserves its thickness there`);
    } finally {
      global.stage.disconnect(sample);
    }
    if (edge === start) continue;
    require(frames[0] <= FADED, `the taskbar fades out before it moves to the ${edge} edge`);
    await captureEdge(`taskbar-moved-${edge}`);
  }
}
