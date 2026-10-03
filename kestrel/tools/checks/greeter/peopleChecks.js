import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {lastSessionStart, promptState} from './prompt.js';

const accentStylesheet = () => {
  const file = Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_runtime_dir(), 'kestrel', GLib.getenv('WAYLAND_DISPLAY'), 'greeter-accent.css']));
  return new TextDecoder().decode(file.load_contents(null)[1]);
};

export async function checkPeople(tools) {
  const {pause, capture, events, find, visible, styled, require, press, type, click, output, state} = tools;
  const background = new Gio.Settings({schema_id: 'org.gnome.desktop.background'});

  await press(Clutter.KEY_space, 900);
  const users = find('kestrel-greeter-users');
  require(visible(users) && visible(find('kestrel-greeter-controls')), 'waking the screen shows the people and controls');
  require(promptState(tools).entry.text === '', 'the key that wakes the screen is not typed into the field');
  require(global.stage.context.get_backend().get_default_seat().get_keymap().get_num_lock_state(), 'Num Lock is on, as the last session left it');
  const rows = styled('kestrel-greeter-user', users);
  require(rows.map(row => row.accessible_name).join(', ') === 'Ayesha Khan, Sam Rivera, Another account',
    'people are listed by name with a way to type a hidden account');
  require(rows[0].checked && lastSessionStart(events) === 'ayesha', 'the person who signed in most recently is ready to sign in');
  require(promptState(tools).message === 'Welcome back, Ayesha' && !promptState(tools).warning,
    'information from the sign-in steps is shown');
  await capture(`${output}/login-users.png`);

  await type('tuli');
  require(promptState(tools).secret && promptState(tools).entry.text === 'tuli', 'typing goes into a hidden password field');
  await capture(`${output}/login-password.png`);
  for (let index = 0; index < 4; index++)
    await press(Clutter.KEY_BackSpace, 20);

  const firstAccent = accentStylesheet();
  await click(rows[1], 0);
  await pause(420);
  await capture(`${output}/login-switch-user.png`);
  require(background.get_string('picture-uri-dark').endsWith('/users/2002/wallpaper.jpg'),
    'choosing another person crossfades to their wallpaper');
  await pause(1400);
  require(accentStylesheet() !== firstAccent, 'the accent color follows the chosen wallpaper');
  require(lastSessionStart(events) === 'sam' && promptState(tools).warning && promptState(tools).message === 'Your password expires in 3 days',
    'warnings from the sign-in steps stand out');

  await type('sunflower');
  await press(Clutter.KEY_Return, 1100);
  require(promptState(tools).message === 'That password didn’t work' &&
    events().some(event => event.type === 'authentication-failed' && event.username === 'sam'), 'a wrong password says so');
  require(promptState(tools).entry.text === '' && promptState(tools).entry.reactive && promptState(tools).secret,
    'the password field is cleared and ready for another try');
  await capture(`${output}/login-wrong-password.png`);

  await click(rows[2], 700);
  require(!promptState(tools).secret && promptState(tools).hint === 'Username', 'another account asks for a username first');
  require(background.get_string('picture-options') === 'none', 'another account shows black behind the prompt');
  await capture(`${output}/login-another-account.png`);
  await type('kristof');
  await press(Clutter.KEY_Return, 900);
  const uid = new Gio.Credentials().get_unix_user();
  require(background.get_string('picture-uri-dark') === Gio.File.new_for_path(`${state}/users/${uid}/wallpaper.jpg`).get_uri(),
    'a typed username shows that person’s wallpaper');
  require(lastSessionStart(events) === 'kristof' && promptState(tools).secret && promptState(tools).hint === 'Password',
    'then asks for their password');
  await press(Clutter.KEY_Escape, 500);
  require(promptState(tools).hint === 'Username', 'going back returns to the username');

  await click(rows[0], 1500);
  require(lastSessionStart(events) === 'ayesha' && promptState(tools).secret, 'choosing a listed person again starts over for them');
}
