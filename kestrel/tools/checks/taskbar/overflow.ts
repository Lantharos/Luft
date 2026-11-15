import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import St from 'gi://St';
import {taskbarElements} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {write} from '../apps/lib/files.js';
import {firstStyled, named, styled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {arrange, boxOf, type Arrangement} from '../lib/edge.js';
import {centerOf, click, press, rest, rightClick} from '../lib/input/input.js';
import {fixture, spawn, stop, waitForWindow} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {remember} from '../lib/settings.js';
import {settled} from '../lib/wait.js';
import {fold, tap, touchDown, touchUp} from '../tablet/lib/touch.js';
import {crowding} from './lib/parts.js';

const {require, eventually} = checks('taskbar overflow');
const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const KEYS = ['taskbar-arrangement', 'taskbar-style', 'taskbar-size', 'favorite-apps'];
const SYSTEM = ['tray', 'status', 'clock'];
const COUNTS = [5, 15, 30];
const MOST = COUNTS.at(-1)!;
const PREFIX = 'com.lantharos.KestrelOverflow';
const PLAYING = 'media/now-playing';
const WEATHER = 'weather/now';
const TOUCH_ROW = 52;

interface Layout {
  name: string;
  style: string;
  size?: string;
  islands: Arrangement;
}

const LAYOUTS: Layout[] = [
  {name: 'classic', style: 'bar', islands: [['bottom-start', ['start', 'dock']], ['bottom-end', SYSTEM]]},
  {name: 'classic-large', style: 'bar', size: 'large', islands: [['bottom-start', ['start', 'dock']], ['bottom-end', [WEATHER, ...SYSTEM]]]},
  {name: 'centered', style: 'floating', islands: [['bottom-center', ['start', 'dock']], ['bottom-end', [PLAYING, WEATHER, ...SYSTEM]]]},
  {name: 'separate', style: 'separate', islands: [['bottom-center', ['start', 'dock', PLAYING]], ['bottom-end', [WEATHER, ...SYSTEM]]]},
  {name: 'apps-alone', style: 'separate', islands: [['bottom-start', ['start']], ['bottom-center', ['dock']], ['bottom-end', [PLAYING, ...SYSTEM]]]},
  {name: 'top-end', style: 'floating', islands: [['top-start', [WEATHER]], ['top-end', ['start', 'dock', ...SYSTEM]]]},
  {name: 'left', style: 'bar', islands: [['left-center', ['start', 'dock']], ['left-end', [PLAYING, ...SYSTEM]]]},
  {name: 'side', style: 'separate', islands: [['left-center', ['start', 'dock']], ['bottom-end', [PLAYING, WEATHER, ...SYSTEM]]]},
];

const ids = Array.from({length: MOST}, (_, index) => `${PREFIX}${index}.desktop`);
const launcher = (index: number) =>
  `[Desktop Entry]\nType=Application\nName=Overflow app ${index + 1}\nIcon=application-x-executable\nExec=true\n`;
const launcherPath = (id: string) => GLib.build_filenamev([GLib.get_user_data_dir(), 'applications', id]);

const panels = () => styled('kestrel-panel').filter(panel => panel.mapped);
const primaryPanel = () => named('kestrel-panel')!;
const overflowButton = (panel = primaryPanel()) => named('kestrel-taskbar-overflow', panel) as St.Button | null;
const overflowing = (panel = primaryPanel()) => !!overflowButton(panel)?.mapped;
const popup = () => named('kestrel-app-overflow')!;
const rows = () => styled('kestrel-overflow-row', popup()).filter(row => row.mapped);
const menu = () => named('kestrel-context-menu')!;
const appButton = (id: string, panel = primaryPanel()) => {
  const button = named(`kestrel-app-${id}`, panel);
  return button?.mapped && button.get_parent()!.width > 0 && button.get_parent()!.height > 0 ? button : null;
};
const shownApps = (panel = primaryPanel()) => ids.filter(id => appButton(id, panel)).length;

function standIn(id: string, text: string) {
  return taskbarElements.add({
    id, label: text,
    create: () => {
      const actor = new St.BoxLayout({name: `${id}-stand-in`, style_class: 'kestrel-status-button kestrel-panel-status', y_align: Clutter.ActorAlign.CENTER});
      actor.add_child(new St.Icon({icon_name: 'audio-x-generic-symbolic', icon_size: 16}));
      actor.add_child(new St.Label({text, y_align: Clutter.ActorAlign.CENTER, style: 'margin-left: 8px;'}));
      return {
        actor,
        relayout: ({vertical}) => (actor.orientation = vertical ? Clutter.Orientation.VERTICAL : Clutter.Orientation.HORIZONTAL),
        destroy: () => actor.destroy(),
      };
    },
    watch: () => () => {},
  });
}

const urgent = (apps: string[]) => `
  const {Gio, GLib} = imports.gi;
  for (const id of ${JSON.stringify(apps)})
    Gio.DBus.session.emit_signal(null, '/check', 'com.canonical.Unity.LauncherEntry', 'Update',
      new GLib.Variant('(sa{sv})', ['application://' + id, {'urgent': new GLib.Variant('b', true)}]));
  new GLib.MainLoop(null, false).run();`;

async function nothingOverlaps(label: string) {
  await settled();
  for (const panel of panels()) {
    const crowded = crowding(panel);
    require(!crowded, `${label}: no part of the taskbar overlaps another or leaves the screen${crowded ? ` (${crowded})` : ''}`);
  }
}

async function pin(count: number) {
  settings.set_strv('favorite-apps', ids.slice(0, count));
  await eventually(() => shownApps() === count || overflowing(), `${count} pinned apps join the taskbar`);
}

async function checkPopup(name: string) {
  const hidden = MOST - shownApps();
  click(overflowButton()!);
  await eventually(() => popup().visible && popup().opacity === 255 && rows().length === hidden,
    `the overflow button lists the ${hidden} apps there's no room for`);
  await settled();
  const box = boxOf(popup());
  require(panels().every(panel => !crowding(panel)), 'the taskbar stays in place while the list is open');
  require(box.width > 0 && box.height > 0, 'the list of more apps opens on screen');
  await capture(`taskbar-overflow-${name}-popup`);
  rightClick(rows()[0]);
  await eventually(() => menu().visible && named('Unpin from taskbar', menu()), 'right-clicking an app in the list opens its menu');
  press(Clutter.KEY_Escape);
  await eventually(() => !menu().visible, 'Escape closes the app menu');
  press(Clutter.KEY_Escape);
  await eventually(() => !popup().visible, 'Escape closes the list');
}

async function checkLayout(layout: Layout) {
  settings.set_string('taskbar-style', layout.style);
  settings.set_string('taskbar-size', layout.size ?? 'normal');
  arrange(layout.islands);
  for (const count of COUNTS) {
    await pin(count);
    await nothingOverlaps(`${layout.name} with ${count} apps`);
    if (count === COUNTS[0]) require(!overflowing() && shownApps() === count, `${layout.name}: a few apps all fit without an overflow button`);
  }
  if (overflowing()) {
    require(shownApps() > 0, `${layout.name}: the apps that fit stay on the taskbar`);
    await capture(`taskbar-overflow-${layout.name}`);
    await checkPopup(layout.name);
  }
}

async function checkFocused() {
  const last = ids.at(-1)!;
  require(!appButton(last), 'the last app starts out behind the overflow button');
  const client = spawn(['python3', fixture('clients', 'wayland', 'namedClient.py'), 'Overflow focus', last.replace(/\.desktop$/, '')]);
  try {
    await waitForWindow('Overflow focus');
    await eventually(() => appButton(last), 'the focused app always gets a place on the taskbar');
    await nothingOverlaps('with the focused app pulled out of the overflow');
    await capture('taskbar-overflow-focused');
  } finally {
    await stop(client);
  }
  const wanting = ids.at(-2)!;
  const asking = spawn(['gjs', '-c', urgent([wanting])]);
  try {
    await eventually(() => appButton(wanting), 'an app asking for attention leaves the overflow');
  } finally {
    await stop(asking);
  }
  const everyone = [ids.slice(0, MOST / 2), ids.slice(MOST / 2)].map(half => spawn(['gjs', '-c', urgent(half)]));
  try {
    await eventually(() => firstStyled('kestrel-task-attention', overflowButton()!)?.visible,
      'the overflow button flashes when apps asking for attention outnumber the room');
  } finally {
    for (const process of everyone) await stop(process);
  }
}

const strip = () => named('kestrel-tablet-strip', primaryPanel());

async function expanded() {
  if (strip()?.visible) await tap(centerOf(strip()!));
  await eventually(() => !strip()?.visible && primaryPanel().get_transition('translation-y') === null, 'the tablet taskbar is out');
}

async function checkTablet() {
  await fold(true);
  try {
    await eventually(() => strip()?.visible && strip()!.opacity === 255 && primaryPanel().get_transition('translation-y') === null,
      'folding into a tablet tucks the taskbar into a strip');
    for (const count of COUNTS) {
      await expanded();
      await pin(count);
      await expanded();
      await nothingOverlaps(`the tablet taskbar with ${count} apps`);
    }
    await capture('taskbar-overflow-tablet');
    if (!overflowing()) return;
    await tap(centerOf(overflowButton()!));
    await eventually(() => popup().visible && rows().length === MOST - shownApps(), 'tapping the overflow button lists the other apps');
    await settled();
    require(rows().every(row => row.height >= TOUCH_ROW), 'the list is sized for fingers');
    await capture('taskbar-overflow-tablet-popup');
    touchDown(centerOf(rows()[0]));
    await eventually(() => menu().visible, 'touching and holding an app in the list opens its menu', 2000);
    touchUp();
    press(Clutter.KEY_Escape);
    await eventually(() => !menu().visible, 'the menu closes');
    await tap([20, 20]);
    await eventually(() => !popup().visible, 'tapping outside closes the list');
  } finally {
    await fold(false);
  }
}

export async function run() {
  const restore = remember(settings, KEYS);
  const appSystem = Shell.AppSystem.get_default();
  ids.forEach((id, index) => write(launcherPath(id), launcher(index)));
  const extensions = [standIn(PLAYING, 'Arrival by the sea'), standIn(WEATHER, 'Sunny, 21°')];
  try {
    await eventually(() => ids.every(id => appSystem.lookup_app(id)), 'the launchers are picked up');
    for (const layout of LAYOUTS) await checkLayout(layout);
    settings.reset('taskbar-size');
    settings.set_string('taskbar-style', 'bar');
    arrange(LAYOUTS[0].islands);
    await pin(MOST);
    if (overflowing()) await checkFocused();
    await checkTablet();
  } finally {
    rest();
    for (const remove of extensions) remove();
    restore();
    for (const id of ids) GLib.unlink(launcherPath(id));
  }
}
