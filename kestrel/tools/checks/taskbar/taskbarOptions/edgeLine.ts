import type Meta from 'gi://Meta';

import {gjs, stop, waitForWindow} from '../../lib/processes.js';
import {captureFrame} from '../../lib/screenshots.js';
import {taskbarEdge, vertical} from '../../lib/edge.js';
import {plainWallpaper, withWallpaper} from './looks.js';
import {eventually, panelBox, set} from './taskbar.js';

const DEPTH = 6;
const LINE_STEP = 12;
const NO_LINE = 6;

async function lineAt(fraction: number) {
  const box = panelBox();
  const {pixbuf} = await captureFrame(box);
  const pixels = pixbuf.get_pixels();
  const along = Math.round((vertical() ? box.height : box.width) * fraction);
  const inner = {bottom: 0, top: box.height - 1, left: box.width - 1, right: 0}[taskbarEdge()];
  const inward = taskbarEdge() === 'bottom' || taskbarEdge() === 'right' ? 1 : -1;
  const lightness = (across: number) => {
    const [x, y] = vertical() ? [across, along] : [along, across];
    const offset = y * pixbuf.get_rowstride() + x * pixbuf.get_n_channels();
    return (pixels[offset] + pixels[offset + 1] + pixels[offset + 2]) / 3;
  };
  return lightness(inner) - lightness(inner + inward * DEPTH);
}

const lined = async (fraction: number) => await lineAt(fraction) >= LINE_STEP;
const unlined = async (fraction: number) => Math.abs(await lineAt(fraction)) <= NO_LINE;

function fillFirstHalf(window: Meta.Window) {
  const area = window.get_work_area_current_monitor();
  if (vertical()) window.move_resize_frame(true, area.x, area.y, area.width, Math.round(area.height / 2));
  else window.move_resize_frame(true, area.x, area.y, Math.round(area.width / 2), area.height);
}

export async function checkEdgeLine() {
  set('taskbar-style', 'bar');
  set('taskbar-look', 'glass');
  await withWallpaper(plainWallpaper('black', 0), async () => {
    await eventually(async () => await unlined(0.25) && await unlined(0.75), 'over a black wallpaper the edge-to-edge taskbar draws no line along its edge');
    const app = gjs('clients/windows/window.js');
    try {
      const window = await waitForWindow('Kestrel window check');
      fillFirstHalf(window);
      await eventually(async () => await lined(0.25) && await unlined(0.75), 'the taskbar draws its line only along a window resting against it');
      window.maximize();
      await eventually(async () => await lined(0.25) && await lined(0.75), 'the line runs along the whole taskbar under a maximized window');
    } finally {
      await stop(app);
    }
    await eventually(async () => await unlined(0.25) && await unlined(0.75), 'the line goes once the window closes');
  });
}
