import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {checks} from '../../lib/check.js';
import {changes} from '../lib/apps.js';
import {show} from './navigation.js';

const {require} = checks('Luft app');
const ANTIALIASING = 8;
const PREVIEW_CLOCK = {x: 880, y: 364, width: 118, height: 30};
const CHANGES = [
  {name: 'taskbar-alignment', page: 'appearance/taskbar', schema: 'com.lantharos.kestrel', key: 'taskbar-alignment', value: new GLib.Variant('s', 'left'),
    ignore: PREVIEW_CLOCK},
  {name: 'dark-style', page: 'appearance', schema: 'org.gnome.desktop.interface', key: 'color-scheme', value: new GLib.Variant('s', 'prefer-light')},
  {name: 'reduce-animations', page: 'accessibility', schema: 'org.gnome.desktop.interface', key: 'enable-animations', value: new GLib.Variant('b', false)},
];

function around({x, y, width, height}, frame) {
  return [
    {x: 0, y: 0, width: frame.width, height: y},
    {x: 0, y, width: x, height},
    {x: x + width, y, width: frame.width - x - width, height},
    {x: 0, y: y + height, width: frame.width, height: frame.height - y - height},
  ];
}

async function look(app, ignore) {
  const frame = app.window.get_frame_rect();
  const regions = ignore ? around(ignore, frame) : [{x: 0, y: 0, width: frame.width, height: frame.height}];
  const frames = [];
  for (const region of regions) frames.push(await app.frame(app.area(region)));
  return frames;
}

const alike = (a, b) => a.every((frame, index) => frame.looksLike(b[index], ANTIALIASING));

async function follow(app, {name, page, schema, key, value, ignore}) {
  const settings = new Gio.Settings({schema_id: schema});
  const saved = settings.get_value(key);
  try {
    await show(app, page);
    await changes(app, `settings follows ${schema} ${key}`, () => settings.set_value(key, value));
    (await app.settle(() => true)).save(`settings-live-${name}`);
    const followed = await look(app, ignore);
    await show(app, 'about');
    const opened = await show(app, page);
    const same = alike(followed, await look(app, ignore));
    if (!same) opened.save(`settings-live-${name}-opened`);
    require(same, `settings shows ${schema} ${key} changed from outside while ${page} is open`);
  } finally {
    const before = await app.frame();
    settings.set_value(key, saved);
    await app.changes(before, `settings follows ${schema} ${key} back`);
  }
}

export async function checkLive(app) {
  for (const change of CHANGES) await follow(app, change);
}
