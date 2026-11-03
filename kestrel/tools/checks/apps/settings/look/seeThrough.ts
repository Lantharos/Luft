import Gio from 'gi://Gio';

import type {LuftApp} from '../../../lib/apps/luftApp.js';
import {settled} from '../../../lib/wait.js';
import {changes} from '../../lib/apps.js';
import {scrollToEnd} from '../navigation.js';

const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const KEYS = ['see-through-apps', 'see-through-shows'];

export async function checkSeeThrough(app: LuftApp) {
  try {
    kestrel.set_strv('see-through-apps', ['com.lantharos.tern.desktop']);
    await settled();
    (await scrollToEnd(app, await app.settle(() => true))).save('settings-see-through-everything');
    await changes(app, 'settings shows that see-through windows show only the wallpaper', () => kestrel.set_string('see-through-shows', 'wallpaper'));
    (await app.settle(() => true)).save('settings-see-through-wallpaper');
  } finally {
    for (const key of KEYS) kestrel.reset(key);
    await settled();
  }
}
