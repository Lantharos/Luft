import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type {LuftApp} from '../../../lib/apps/luftApp.js';
import {captureEdge} from '../../../taskbar/taskbarOptions/taskbar.js';
import {settled} from '../../../lib/wait.js';
import {capture} from '../../../lib/screenshots.js';
import {useScheme} from '../../lib/palette.js';
import {show} from '../navigation.js';

const LOOKS = ['glass', 'solid', 'transparent', 'accent'];
const LAYOUTS: [string, string, [string, string[]][]][] = [
  ['side', 'separate', [['left-center', ['start', 'dock']], ['bottom-end', ['tray', 'status', 'clock']]]],
  ['mac', 'separate', [['bottom-center', ['start', 'dock']], ['top-end', ['tray', 'status', 'clock']]]],
  ['start-alone', 'separate', [['bottom-start', ['start']], ['bottom-center', ['dock']], ['bottom-end', ['tray', 'status', 'clock']]]],
];
const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});

export async function checkTaskbarLayouts(app: LuftApp) {
  await show(app, 'taskbar');
  try {
    for (const [name, style, islands] of LAYOUTS) {
      kestrel.set_string('taskbar-style', style);
      kestrel.set_value('taskbar-arrangement', new GLib.Variant('a(sas)', islands));
      await settled();
      (await app.settle(() => true)).save(`settings-taskbar-layout-${name}`);
      await capture(`settings-taskbar-layout-${name}-desktop`);
    }
  } finally {
    for (const key of ['taskbar-style', 'taskbar-arrangement']) kestrel.reset(key);
  }
}

export async function checkTaskbarLooks(app: LuftApp) {
  await show(app, 'taskbar');
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
