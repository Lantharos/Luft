import Gio from 'gi://Gio';

import {captureBottom} from '../../panel/taskbarOptions/taskbar.js';
import {settled} from '../../lib/wait.js';
import {useScheme} from '../lib/palette.js';
import {show} from './navigation.js';

const LOOKS = ['glass', 'solid', 'transparent', 'accent'];
const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});

export async function checkTaskbarLooks(app) {
  await show(app, 'appearance/taskbar');
  try {
    for (const scheme of ['light', 'dark']) {
      useScheme(scheme);
      for (const look of LOOKS) {
        kestrel.set_string('taskbar-look', look);
        await settled();
        (await app.settle(() => true)).save(`settings-taskbar-${look}-${scheme}`);
        await captureBottom(`taskbar-${look}-${scheme}`);
      }
    }
  } finally {
    kestrel.reset('taskbar-look');
  }
}
