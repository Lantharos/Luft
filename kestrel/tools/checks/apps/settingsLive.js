import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {LuftApp, sleep} from './luftApp.js';

const LOADING = 600;
const ANTIALIASING = 8;
const CHANGES = [
  {name: 'taskbar-alignment', page: 'appearance/taskbar', schema: 'com.lantharos.kestrel', key: 'taskbar-alignment', value: new GLib.Variant('s', 'left')},
  {name: 'dark-style', page: 'appearance', schema: 'org.gnome.desktop.interface', key: 'color-scheme', value: new GLib.Variant('s', 'prefer-light')},
  {name: 'reduce-animations', page: 'accessibility', schema: 'org.gnome.desktop.interface', key: 'enable-animations', value: new GLib.Variant('b', false)},
];

async function shown(app) {
  await app.settle(() => true);
  await sleep(LOADING);
  return app.settle(() => true);
}

async function shownWith(page, change = () => {}) {
  const app = new LuftApp('settings', [`kestrel-settings:${page}`]);
  try {
    await app.open();
    await shown(app);
    change();
    return await shown(app);
  } finally {
    await app.close();
  }
}

async function follow({name, page, schema, key, value}, {require, output}) {
  const settings = new Gio.Settings({schema_id: schema});
  const saved = settings.get_value(key);
  try {
    const followed = await shownWith(page, () => settings.set_value(key, value));
    followed.save(`${output}/settings-live-${name}.png`);
    const opened = await shownWith(page);
    if (!followed.looksLike(opened, ANTIALIASING)) opened.save(`${output}/settings-live-${name}-opened.png`);
    require(followed.looksLike(opened, ANTIALIASING), `settings shows ${schema} ${key} changed from outside while ${page} is open`);
  } finally {
    settings.set_value(key, saved);
    await sleep(LOADING);
  }
}

export async function checkSettingsLive(context) {
  context.styles.interface.set_string('color-scheme', 'prefer-dark');
  for (const change of CHANGES) await follow(change, context);
}
