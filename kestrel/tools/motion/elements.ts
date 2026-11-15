import GLib from 'gi://GLib';

import {descendants} from '../checks/lib/actors.js';
import {installBuilt, request, setSetting} from '../checks/extensions/lib/extensions.js';
import {moveTo, rest} from '../checks/lib/input/input.js';
import {fixture, gjs, stop} from '../checks/lib/processes.js';
import {settled, waitUntil} from '../checks/lib/wait.js';
import type {Area, Clip} from './film.js';

const NOW_PLAYING = 'com.lantharos.NowPlaying';
const ELEMENT = `extension-element:${NOW_PLAYING}/now-playing`;
const MARGIN = 24;
const GROWS_BY = 260;
const LAYOUTS = {under: 'compact', beside: 'full'};

const nowPlaying = () => descendants(global.stage).find(actor => actor.name === ELEMENT && actor.mapped && actor.opacity === 255 && actor.width > 40);

async function taskbarElement(clip: Clip) {
  await installBuilt(NOW_PLAYING);
  const player = gjs('clients/apps/musicPlayer.js', ['KestrelMotionMusic', 'Tunes', 'Harbour Lights', 'Ocean Glass', fixture('media', 'cover.png')]);
  try {
    const element = await waitUntil(nowPlaying, 'Now Playing is in the taskbar', 8000);
    for (const [controls, layout] of Object.entries(LAYOUTS)) {
      await setSetting(NOW_PLAYING, 'layout', new GLib.Variant('s', layout));
      await settled();
      const [x, y] = element.get_transformed_position();
      const area: Area = [x - GROWS_BY - MARGIN, y - MARGIN, element.width + GROWS_BY + MARGIN * 2, element.height + MARGIN * 2];
      await clip(`taskbar-element-grows-controls-${controls}`, () => moveTo([x + 14, y + element.height / 2]),
        {notes: `The pointer comes over Now Playing, its controls ${controls} the title`, area});
      await clip(`taskbar-element-shrinks-controls-${controls}`, () => rest(), {notes: 'The pointer leaves it', area});
    }
  } finally {
    rest();
    await stop(player);
    await request('Remove', NOW_PLAYING);
  }
}

export const elementGroups = {taskbarElement};
