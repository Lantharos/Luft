import Gio from 'gi://Gio';

import {settled} from '../../lib/wait.js';
import {show} from './navigation.js';

const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const SHOWN = [['tiling', 'dwindle'], ['tiling', 'master'], ['scrolling', 'dwindle']];

export async function checkTiling(app) {
  await show(app, 'appearance/tiling');
  try {
    for (const [mode, layout] of SHOWN) {
      kestrel.set_string('tiling-layout', layout);
      kestrel.set_string('window-tiling', mode);
      await settled();
      (await app.settle(() => true)).save(`settings-tiling-${mode}-${layout}`);
    }
  } finally {
    kestrel.reset('window-tiling');
    kestrel.reset('tiling-layout');
    await settled();
  }
}
