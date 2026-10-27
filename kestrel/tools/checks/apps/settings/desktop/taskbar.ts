import Gio from 'gi://Gio';

import type {LuftApp} from '../../../lib/apps/luftApp.js';
import {captureBottom} from '../../../taskbar/taskbarOptions/taskbar.js';
import {settled} from '../../../lib/wait.js';
import {useScheme} from '../../lib/palette.js';
import {show} from '../navigation.js';

const LOOKS = ['glass', 'solid', 'transparent', 'accent'];
const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});

export async function checkTaskbarLooks(app: LuftApp) {
  await show(app, 'desktop');
  try {
    for (const scheme of ['light', 'dark'] as const) {
      useScheme(scheme);
      for (const look of LOOKS) {
        kestrel.set_string('taskbar-look', look);
        await settled();
        (await app.settle(() => true)).save(`settings-taskbar-${look}-${scheme}`);
        await captureBottom(`taskbar-${look}-${scheme}`);
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
