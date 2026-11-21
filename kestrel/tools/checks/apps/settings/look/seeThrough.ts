import Gio from 'gi://Gio';

import type {LuftApp} from '../../../lib/apps/luftApp.js';
import {settled} from '../../../lib/wait.js';
import {changes} from '../../lib/apps.js';
import {scrollToEnd} from '../navigation.js';

const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const glass = new Gio.Settings({schema_id: 'com.lantharos.kestrel.glass'});

export async function checkSeeThrough(app: LuftApp) {
  try {
    kestrel.set_strv('see-through-apps', ['com.lantharos.terminal.desktop']);
    await settled();
    (await scrollToEnd(app, await app.settle(() => true))).save('settings-see-through-luca');
    await changes(app, 'settings shows that see-through windows use Maris', () => glass.set_string('see-through', 'maris'));
    (await app.settle(() => true)).save('settings-see-through-maris');
  } finally {
    kestrel.reset('see-through-apps');
    glass.reset('see-through');
    await settled();
  }
}
