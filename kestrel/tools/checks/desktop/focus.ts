import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import St from 'gi://St';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {descendants, shown, showsText, styled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {click, moveTo, rest} from '../lib/input/input.js';
import {clearNotifications} from '../lib/notifications.js';
import {capture} from '../lib/screenshots.js';
import {pause, settled} from '../lib/wait.js';
import {withApp} from '../apps/lib/apps.js';
import {show} from '../apps/settings/navigation.js';
import {installBuilt, listed, request} from '../extensions/lib/extensions.js';

const {require, eventually} = checks('Focus');
const FOCUS = 'com.lantharos.Focus';
const SOUNDSCAPES = 'com.lantharos.Soundscapes';
const ELEMENT = `extension-element:${FOCUS}/focus`;
const SESSION_MS = 6000;
const NAME = 'com.lantharos.Kestrel';
const PATH = '/com/lantharos/Kestrel/Extensions';
const IFACE = 'com.lantharos.Kestrel.Extensions';
const storageFile = () => GLib.build_filenamev([GLib.get_user_state_dir(), 'luft', 'extension-storage', `${FOCUS}.json`]);

const element = () => descendants(global.stage).find(actor => actor.name === ELEMENT && actor.mapped) ?? null;
const popup = () => descendants(global.stage).find(actor => actor.name === 'kestrel-extension-popup' && actor.mapped) ?? null;
const button = (root: Clutter.Actor, name: string) => descendants(root).find(actor => actor instanceof St.Button && actor.accessible_name === name && actor.mapped) as St.Button | undefined;
const mentions = (root: Clutter.Actor | null, text: string) => !!root && descendants(root).some(actor => actor instanceof St.Label && actor.mapped && actor.text.includes(text));
const banners = () => styled('notification-banner', Main.uiGroup).filter(shown);
const bannerSays = (text: string) => banners().some(banner => showsText(text, banner));

async function soundscapesPlays(): Promise<boolean> {
  const [json] = (await call(NAME, PATH, IFACE, 'Page', new GLib.Variant('(s)', [SOUNDSCAPES]), '(s)')).deepUnpack<[string]>();
  return (JSON.parse(json) as {items: {type: string; checked?: boolean}[]}[])[0]!.items[0]!.checked === true;
}

async function notify(app: string, title: string) {
  await call('org.gnome.Shell', '/org/freedesktop/Notifications', 'org.freedesktop.Notifications', 'Notify',
    new GLib.Variant('(susssasa{sv}i)', [app, 0, '', title, 'Can you take a look?', [], {}, -1]), '(u)');
}

async function shortSession() {
  await request('Disable', FOCUS);
  GLib.mkdir_with_parents(GLib.path_get_dirname(storageFile()), 0o700);
  GLib.file_set_contents(storageFile(), JSON.stringify({session: {minutes: 25, endsAt: Date.now() + SESSION_MS, left: null, soundscapes: true}}));
  await request('Reload', FOCUS);
  await request('Enable', FOCUS);
}

async function checkStarting() {
  const idle = await eventually(element, 'Focus sits in the taskbar');
  await settled();
  click(idle);
  const panel = await eventually(popup, 'clicking it opens its pop-up');
  await eventually(() => panel.opacity === 255, 'the pop-up fades in');
  require(mentions(panel, '25:00') && mentions(panel, 'Soundscapes plays while you work'), 'it offers a 25 minute session with Soundscapes');
  click(button(panel, '45 min')!);
  await eventually(() => mentions(popup(), '45:00'), 'picking another length changes the session');
  await capture('focus-start');
  click(button(popup()!, 'Start')!);
  await eventually(() => mentions(popup(), 'Until'), 'starting it counts down');
  await eventually(soundscapesPlays, 'and Soundscapes plays');
  await notify('Chatter', 'Noor wrote');
  await notify('Mailman', 'Invoice for October');
  await eventually(() => mentions(popup(), '2 notifications waiting'), 'notifications wait during the session');
  require(!banners().length, 'without banners');
  await capture('focus-running');
  click(button(popup()!, 'Pause')!);
  await eventually(() => mentions(popup(), 'Paused'), 'it can be paused');
  click(button(popup()!, 'Resume')!);
  await eventually(() => mentions(popup(), 'Until'), 'and picked up again');
  click(element()!);
  await eventually(() => !popup(), 'clicking it again closes the pop-up');
  rest();
  await eventually(() => mentions(element(), '45 min'), 'the taskbar shows the minutes left');
  await capture('focus-taskbar');
  const [x, y] = element()!.get_transformed_position();
  moveTo([x + 10, y + element()!.height / 2]);
  await eventually(() => button(element()!, 'End'), 'under the pointer it shows the seconds and its controls');
  await pause(400);
  await capture('focus-expanded');
  click(button(element()!, 'End')!);
  await eventually(() => !button(element()!, 'End'), 'its End button ends the session');
  rest();
  await eventually(() => bannerSays('Less than a minute of focus') && bannerSays('2 notifications from Chatter and Mailman'),
    'ending it sums up how long it lasted and what came in');
  await capture('focus-summary');
  await eventually(async () => !await soundscapesPlays(), 'and Soundscapes stops');
}

async function checkEnding() {
  clearNotifications();
  await shortSession();
  await eventually(() => mentions(element(), 'min'), 'a session kept across a restart carries on');
  await notify('Chatter', 'Sam wrote');
  await pause(500);
  require(!banners().length, 'and holds notifications back');
  await eventually(() => bannerSays('25 minutes of focus'), 'at its end it says how long it lasted', SESSION_MS * 2);
  require(bannerSays('One notification from Chatter'), 'and what came in meanwhile');
  await eventually(() => !mentions(element(), 'min'), 'and the taskbar goes back to its icon');
}

export async function run() {
  await installBuilt(SOUNDSCAPES);
  await installBuilt(FOCUS);
  try {
    await eventually(async () => (await listed(FOCUS))?.state === 'running', 'Focus runs once installed');
    clearNotifications();
    await checkStarting();
    await checkEnding();
    clearNotifications();
    await withApp('settings', [], async app => (await show(app, `extensions/${FOCUS.toLowerCase()}`)).save('focus-settings'));
  } finally {
    clearNotifications();
    await request('Remove', FOCUS);
    await request('Remove', SOUNDSCAPES);
  }
}
