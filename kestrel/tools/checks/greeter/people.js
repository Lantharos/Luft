import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {named, shown, styled} from '../lib/actors.js';
import {click, press, type} from '../lib/input.js';
import {capture} from '../lib/screenshots.js';
import {eventually, events, lastSessionStart, promptState, require} from './prompt.js';

function accentStylesheet() {
  const file = Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_runtime_dir(), 'kestrel', GLib.getenv('WAYLAND_DISPLAY'), 'greeter-accent.css']));
  return new TextDecoder().decode(file.load_contents(null)[1]);
}

const typed = text => promptState().entry?.text === text;

export async function checkPeople() {
  const background = new Gio.Settings({schema_id: 'org.gnome.desktop.background'});

  press(Clutter.KEY_space);
  await eventually(() => shown(named('kestrel-greeter-users')) && shown(named('kestrel-greeter-controls')),
    'waking the screen shows the people and controls');
  const users = named('kestrel-greeter-users');
  require(typed(''), 'the key that wakes the screen is not typed into the field');
  require(global.stage.context.get_backend().get_default_seat().get_keymap().get_num_lock_state(), 'Num Lock is on, as the last session left it');
  const rows = styled('kestrel-greeter-user', users).filter(row => row.mapped);
  require(rows.map(row => row.accessible_name).join(', ') === 'Ayesha Khan, Sam Rivera, Another account',
    'people are listed by name with a way to type a hidden account');
  await eventually(() => rows[0].checked && lastSessionStart() === 'ayesha', 'the person who signed in most recently is ready to sign in');
  await eventually(() => promptState().message === 'Welcome back, Ayesha' && !promptState().warning,
    'information from the sign-in steps is shown');
  await capture('login-users');

  type('tuli');
  await eventually(() => promptState().secret && typed('tuli'), 'typing goes into a hidden password field');
  await capture('login-password');
  for (let index = 0; index < 4; index++) press(Clutter.KEY_BackSpace);
  await eventually(() => typed(''), 'erasing empties the password field');

  const firstAccent = accentStylesheet();
  click(rows[1]);
  await eventually(() => background.get_string('picture-uri-dark').endsWith('/users/2002/wallpaper.jpg'),
    'choosing another person crossfades to their wallpaper');
  await eventually(() => accentStylesheet() !== firstAccent, 'the accent color follows the chosen wallpaper');
  await eventually(() => lastSessionStart() === 'sam' && promptState().warning && promptState().message === 'Your password expires in 3 days',
    'warnings from the sign-in steps stand out');
  await capture('login-switch-user');

  type('sunflower');
  await eventually(() => typed('sunflower'), 'the password is typed');
  press(Clutter.KEY_Return);
  await eventually(() => promptState().message === 'That password didn’t work' &&
    events().some(event => event.type === 'authentication-failed' && event.username === 'sam'), 'a wrong password says so');
  await eventually(() => typed('') && promptState().entry.reactive && promptState().secret,
    'the password field is cleared and ready for another try');
  await capture('login-wrong-password');

  click(rows[2]);
  await eventually(() => !promptState().secret && promptState().hint === 'Username', 'another account asks for a username first');
  require(background.get_string('picture-options') === 'none', 'another account shows black behind the prompt');
  await capture('login-another-account');
  type('kristof');
  await eventually(() => typed('kristof'), 'the username is typed');
  press(Clutter.KEY_Return);
  const uid = new Gio.Credentials().get_unix_user();
  const state = GLib.getenv('KESTREL_GREETER_STATE_DIR');
  await eventually(() => background.get_string('picture-uri-dark') === Gio.File.new_for_path(`${state}/users/${uid}/wallpaper.jpg`).get_uri(),
    'a typed username shows that person’s wallpaper');
  await eventually(() => lastSessionStart() === 'kristof' && promptState().secret && promptState().hint === 'Password',
    'then asks for their password');
  press(Clutter.KEY_Escape);
  await eventually(() => promptState().hint === 'Username', 'going back returns to the username');

  click(rows[0]);
  await eventually(() => lastSessionStart() === 'ayesha' && promptState().secret, 'choosing a listed person again starts over for them');
}
