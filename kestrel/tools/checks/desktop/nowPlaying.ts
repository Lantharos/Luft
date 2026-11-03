import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

import {descendants, showsText} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {click, moveTo, rest} from '../lib/input/input.js';
import {fixture, gjs, stop, stopAll, type Process} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {pause} from '../lib/wait.js';
import {installBuilt, listed, request, setSetting} from '../extensions/lib/extensions.js';

const {require, eventually} = checks('Now Playing');
const NOW_PLAYING = 'com.lantharos.NowPlaying';
const ELEMENT = `extension-element:${NOW_PLAYING}/now-playing`;
const LENGTH_S = 214;
const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});

const element = () => descendants(global.stage).find(actor => actor.name === ELEMENT) ?? null;
const shown = () => {
  const actor = element();
  return !!actor?.mapped && actor.opacity === 255 && actor.width > 40;
};
const gone = () => !element()?.visible;
const popup = () => descendants(global.stage).find(actor => actor.name === 'kestrel-extension-popup' && actor.mapped) ?? null;
const mentions = (root: Clutter.Actor, text: string) => descendants(root).some(actor => actor instanceof St.Label && actor.mapped && actor.text.includes(text));
const buttonNamed = (root: Clutter.Actor, name: string) => descendants(root).find(actor => actor instanceof St.Button && actor.accessible_name === name) as St.Button | undefined;

function player(name: string, identity: string, title: string, artist: string, cover: string): Process {
  return gjs('clients/apps/musicPlayer.js', [name, identity, title, artist, fixture('media', cover)]);
}

async function playerProperty(name: string, property: string) {
  const reply = await call(`org.mpris.MediaPlayer2.${name}`, '/org/mpris/MediaPlayer2', 'org.freedesktop.DBus.Properties', 'Get',
    new GLib.Variant('(ss)', ['org.mpris.MediaPlayer2.Player', property]), '(v)');
  return reply.recursiveUnpack<[unknown]>()[0];
}

export async function run() {
  await installBuilt(NOW_PLAYING);
  const players: Process[] = [];
  try {
    await eventually(async () => (await listed(NOW_PLAYING))?.state === 'running', 'Now Playing runs once installed');
    await pause(400);
    require(gone(), 'with nothing playing it takes no room in the taskbar');

    players.push(player('KestrelCheckMusic', 'Tunes', 'I like the way it moves when the light comes through', 'Ocean Glass', 'cover.png'));
    await eventually(shown, 'something playing brings it into the taskbar');
    const actor = element()!;
    await eventually(() => showsText('Ocean Glass', actor), 'it shows the artist, and the cover once it’s read');
    await pause(400);
    await capture('now-playing-taskbar');

    const compact = actor.width;
    moveTo([actor.get_transformed_position()[0] + 14, actor.get_transformed_position()[1] + actor.height / 2]);
    await eventually(() => actor.width > compact + 40, 'it grows under the pointer');
    await pause(500);
    await eventually(() => mentions(actor, '/ 3:34 · Tunes'), 'and shows which app plays and how far along');
    await capture('now-playing-grown');

    buttonNamed(actor, 'Pause')!.emit('clicked', 1);
    await eventually(async () => await playerProperty('KestrelCheckMusic', 'PlaybackStatus') === 'Paused', 'its pause button pauses the player');
    await eventually(() => !!buttonNamed(actor, 'Play'), 'and turns into a play button');
    buttonNamed(actor, 'Play')!.emit('clicked', 1);

    const [x, y] = actor.get_transformed_position();
    click([x + 14, y + actor.height / 2]);
    const panel = await eventually(popup, 'clicking it opens a pop-up');
    await eventually(() => panel.opacity === 255, 'the pop-up fades in');
    const slider = descendants(panel).find(child => child instanceof St.Widget && child.has_style_class_name('slider')) as unknown as {value: number};
    require(slider, 'the pop-up can seek in the track');
    slider.value = 0.5;
    await eventually(async () => Math.abs(Number(await playerProperty('KestrelCheckMusic', 'Position')) / 1e6 - LENGTH_S / 2) < 3, 'moving the slider seeks the player');

    players.push(player('KestrelCheckRadio', 'Radio', 'Evening Edition', 'Station Nine', 'second.png'));
    await eventually(() => mentions(popup()!, 'Radio'), 'a second player shows up in the pop-up to switch to');
    await pause(300);
    await capture('now-playing-popup');
    (descendants(popup()!).find(child => child instanceof St.Button && child.accessible_name?.startsWith('Radio')) as St.Button).emit('clicked', 1);
    await eventually(() => showsText('Station Nine', element()!), 'choosing it makes the taskbar follow it');
    rest();
    await pause(300);
    if (popup()) click([20, 20]);

    await setSetting(NOW_PLAYING, 'hide-paused', new GLib.Variant('b', true));
    await call('org.mpris.MediaPlayer2.KestrelCheckRadio', '/org/mpris/MediaPlayer2', 'org.mpris.MediaPlayer2.Player', 'PlayPause', null);
    await eventually(() => showsText('Ocean Glass', element()!), 'pausing the one it follows moves on to the one still playing');

    kestrel.set_string('taskbar-position', 'left');
    await eventually(() => element()?.mapped && element()!.height > element()!.width, 'on a side of the display it stands upright');
    await pause(500);
    await capture('now-playing-vertical');
    kestrel.reset('taskbar-position');

    for (const process of players.splice(0)) await stop(process);
    await eventually(gone, 'when nothing plays any more it leaves the taskbar', 6000);
  } finally {
    for (const process of players) await stop(process);
    await request('Remove', NOW_PLAYING);
    await stopAll();
    for (const key of ['extension-settings', 'taskbar-position']) kestrel.reset(key);
  }
}
