import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type {LuftApp} from '../../lib/apps/luftApp.js';
import {checks} from '../../lib/check.js';
import type {Area, Frame} from '../../lib/screenshots.js';
import {changes} from '../lib/apps.js';
import {show} from './navigation.js';

const {require} = checks('Luft app');
const ANTIALIASING = 8;
const EDGE_PIXELS = 400;
const PREVIEW_CLOCK = {x: 900, y: 312, width: 98, height: 30};

interface Change {
  name: string;
  page: string;
  schema: string;
  key: string;
  value: GLib.Variant;
  ignore?: Area;
}

const CHANGES: Change[] = [
  {name: 'taskbar-alignment', page: 'desktop', schema: 'com.lantharos.kestrel', key: 'taskbar-alignment', value: new GLib.Variant('s', 'left'),
    ignore: PREVIEW_CLOCK},
  {name: 'dark-style', page: 'appearance', schema: 'org.gnome.desktop.interface', key: 'color-scheme', value: new GLib.Variant('s', 'prefer-light')},
  {name: 'reduce-motion', page: 'accessibility', schema: 'org.gnome.desktop.a11y.interface', key: 'reduced-motion', value: new GLib.Variant('s', 'reduce')},
];

function around({x, y, width, height}: Area, frame: {width: number; height: number}): Area[] {
  return [
    {x: 0, y: 0, width: frame.width, height: y},
    {x: 0, y, width: x, height},
    {x: x + width, y, width: frame.width - x - width, height},
    {x: 0, y: y + height, width: frame.width, height: frame.height - y - height},
  ];
}

async function look(app: LuftApp, ignore?: Area) {
  const frame = app.window.get_frame_rect();
  const regions = ignore ? around(ignore, frame) : [{x: 0, y: 0, width: frame.width, height: frame.height}];
  const frames: Frame[] = [];
  for (const region of regions) frames.push(await app.frame(app.area(region)));
  return frames;
}

const alike = (a: Frame[], b: Frame[]) => a.every((frame, index) => frame.pixelsApart(b[index], ANTIALIASING) <= EDGE_PIXELS);

async function follow(app: LuftApp, {name, page, schema, key, value, ignore}: Change) {
  const settings = new Gio.Settings({schema_id: schema});
  const saved = settings.get_value(key);
  try {
    await show(app, page);
    await changes(app, `settings follows ${schema} ${key}`, () => settings.set_value(key, value));
    (await app.settle(() => true)).save(`settings-live-${name}`);
    const followed = await look(app, ignore);
    await show(app, 'system/about');
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

export async function checkLive(app: LuftApp) {
  for (const change of CHANGES) await follow(app, change);
}
