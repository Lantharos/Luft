import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {checker, descendants} from '../portal/backend.js';

const require = checker('lock screen');

function named(name) {
  return descendants(global.stage).find(actor => actor.name === name && actor.mapped) ?? null;
}

function shown(text) {
  return descendants(global.stage).some(actor => actor.text === text && actor.mapped);
}

export async function checkLockControls({pause, capture, output, keyboard}) {
  const escape = () => {
    keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Escape, Clutter.KeyState.PRESSED);
    keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Escape, Clutter.KeyState.RELEASED);
  };
  const interfaceSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  const scheme = interfaceSettings.get_string('color-scheme');

  require(named('kestrel-lock-controls') && named('kestrel-lock-accessibility') && named('kestrel-lock-power'),
    'the unlock prompt shows accessibility and power at the bottom right');

  named('kestrel-lock-accessibility').emit('clicked', 1);
  await pause(400);
  require(['Screen reader', 'Zoom', 'On-screen keyboard', 'High contrast', 'Dwell click', 'Larger text'].every(shown),
    'accessibility offers the screen reader, zoom, on-screen keyboard, high contrast, dwell click and larger text');
  await capture(`${output}/lock-accessibility-dark.png`);
  escape();
  await pause(300);

  named('kestrel-lock-power').emit('clicked', 1);
  await pause(400);
  require(shown('Suspend'), 'power offers suspend while locked');
  await capture(`${output}/lock-power-dark.png`);
  escape();
  await pause(300);

  interfaceSettings.set_string('color-scheme', 'prefer-light');
  await pause(800);
  named('kestrel-lock-power').emit('clicked', 1);
  await pause(400);
  await capture(`${output}/lock-power-light.png`);
  escape();
  await pause(300);
  interfaceSettings.set_string('color-scheme', scheme);
  await pause(800);
  require(!shown('Suspend'), 'menus close again on the lock screen');
}
