import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import {getStyleVariant} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {existing, styled} from '../lib/actors.js';
import {click} from '../lib/input/input.js';
import {capture} from '../lib/screenshots.js';
import {eventually, require} from './lib/prompt.js';

const CHANGE_IN_SECONDS = 4;
const THEO = 2002;

const background = () => new Gio.Settings({schema_id: 'org.gnome.desktop.background'});
const stored = (uid: number, name: string) => Gio.File.new_for_path(GLib.build_filenamev([GLib.getenv('KESTREL_GREETER_STATE_DIR')!, 'users', `${uid}`, name]));
const showing = (uid: number, name: string, key: string) => background().get_string(key) === stored(uid, name).get_uri();

export function checkScheduledStyle() {
  require(getStyleVariant() === 'dark' && showing(2001, 'wallpaper-dark.jpg', 'picture-uri-dark'),
    'the login screen opens in the style the schedule calls for now, with the wallpaper for it, though the desktop last synced in light');
}

export async function checkStyleChange() {
  const now = GLib.DateTime.new_now_local();
  const hour = now.get_hour() + now.get_minute() / 60 + now.get_seconds() / 3600;
  const window = [(hour + 23) % 24, (hour + CHANGE_IN_SECONDS / 3600) % 24];
  GLib.file_set_contents(stored(THEO, 'style.json').get_path()!, JSON.stringify({style: 'dark', schedule: 'custom', window, coordinates: null}));
  Gio.File.new_for_path(`${GLib.getenv('KESTREL_GREETER_IMAGES')}/sam-wallpaper.png`).copy(stored(THEO, 'wallpaper-dark.jpg'), Gio.FileCopyFlags.OVERWRITE, null, null);
  const rows = styled('kestrel-greeter-user', existing('kestrel-greeter-users')).filter((row): row is St.Button => row instanceof St.Button && row.mapped);
  click(rows[2]);
  await eventually(() => getStyleVariant() === 'dark' && showing(THEO, 'wallpaper-dark.jpg', 'picture-uri-dark'),
    'a person whose schedule is in its dark hours is shown dark');
  await capture('login-schedule-dark');
  await eventually(() => getStyleVariant() === 'light' && showing(THEO, 'wallpaper.jpg', 'picture-uri'),
    'the login screen turns light with the light wallpaper when the schedule says so, while it stays on screen', (CHANGE_IN_SECONDS + 4) * 1000);
  await capture('login-schedule-light');
  for (const name of ['style.json', 'wallpaper-dark.jpg']) stored(THEO, name).delete(null);
  click(rows[1]);
  await eventually(() => getStyleVariant() === 'dark', 'choosing someone else brings back their dark style');
}
