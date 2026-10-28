import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';

import type {LuftApp} from '../../../lib/apps/luftApp.js';
import {captureEdge} from '../../../taskbar/taskbarOptions/taskbar.js';
import {settled} from '../../../lib/wait.js';
import {capture} from '../../../lib/screenshots.js';
import {scroll, type Point} from '../../../lib/input/input.js';
import {useScheme} from '../../lib/palette.js';
import {show} from '../navigation.js';

const LOOKS = ['glass', 'solid', 'transparent', 'accent'];
const POSITIONS = ['left', 'top', 'right'];
const TASKBAR_SECTION: Point = [650, 400];
const TO_TASKBAR_SECTION = 4;
const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});

export async function checkTaskbarPositions(app: LuftApp) {
  const top = await show(app, 'desktop');
  for (let step = 0; step < TO_TASKBAR_SECTION; step++) scroll(Clutter.ScrollDirection.DOWN, app.at(TASKBAR_SECTION));
  await app.settle(frame => !frame.looksLike(top));
  try {
    for (const position of POSITIONS) {
      kestrel.set_string('taskbar-position', position);
      await settled();
      (await app.settle(() => true)).save(`settings-taskbar-position-${position}`);
      await capture(`settings-taskbar-position-${position}-desktop`);
    }
  } finally {
    kestrel.reset('taskbar-position');
  }
}

export async function checkTaskbarLooks(app: LuftApp) {
  await show(app, 'desktop');
  try {
    for (const scheme of ['light', 'dark'] as const) {
      useScheme(scheme);
      for (const look of LOOKS) {
        kestrel.set_string('taskbar-look', look);
        await settled();
        (await app.settle(() => true)).save(`settings-taskbar-${look}-${scheme}`);
        await captureEdge(`taskbar-${look}-${scheme}`);
      }
    }
    for (const [style, shown] of [['palette', true], ['menu', false]] as const) {
      kestrel.set_string('start-style', style);
      kestrel.set_boolean('taskbar-shown', shown);
      await settled();
      (await app.settle(() => true)).save(`settings-taskbar-${style}${shown ? '' : '-hidden'}`);
    }
  } finally {
    for (const key of ['taskbar-look', 'start-style', 'taskbar-shown']) kestrel.reset(key);
  }
}
