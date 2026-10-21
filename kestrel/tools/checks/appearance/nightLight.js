import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {checks} from '../lib/check.js';
import {call, property} from '../lib/dbus.js';

const {require, eventually} = checks('night light');
const COLOR = 'com.lantharos.Settings.NightLight';
const COLOR_PATH = '/com/lantharos/Settings/NightLight';
const NEUTRAL = 6500;
const WARM = 3000;
const TRANSITION = 5000;

const read = name => property(COLOR, COLOR_PATH, COLOR, name);

function setPaused(paused) {
  return call(COLOR, COLOR_PATH, 'org.freedesktop.DBus.Properties', 'Set',
    new GLib.Variant('(ssv)', [COLOR, 'DisabledUntilTomorrow', new GLib.Variant('b', paused)]));
}

async function reaches(active, temperature, label) {
  await eventually(async () => await read('NightLightActive') === active && await read('Temperature') === temperature, label, TRANSITION * 2);
}

async function heads(active, temperature, label) {
  const from = await read('Temperature');
  await eventually(async () => await read('NightLightActive') === active &&
    Math.abs(await read('Temperature') - temperature) < Math.abs(from - temperature), label);
}

export async function run() {
  const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel.night-light'});
  const now = GLib.DateTime.new_now_local();
  const hour = now.get_hour() + now.get_minute() / 60;
  const hours = (from, to) => {
    settings.set_double('schedule-from', (hour + from + 24) % 24);
    settings.set_double('schedule-to', (hour + to + 24) % 24);
  };
  try {
    settings.set_boolean('schedule-automatic', false);
    settings.set_uint('temperature', WARM);
    hours(-2, 2);
    settings.set_boolean('enabled', true);
    await reaches(true, WARM, 'the screen warms up during the night light hours');

    await setPaused(true);
    await heads(true, NEUTRAL, 'pausing until tomorrow brings back neutral colors');
    require(await read('DisabledUntilTomorrow'), 'the night light says it is paused until tomorrow');

    await setPaused(false);
    await heads(true, WARM, 'resuming brings the warmth back');

    hours(3, 5);
    await heads(false, NEUTRAL, 'the night light stays off outside its hours');

    hours(-2, 2);
    await heads(true, WARM, 'the night light turns on when its hours begin');

    settings.set_boolean('enabled', false);
    await reaches(false, NEUTRAL, 'turning the night light off restores neutral colors');
  } finally {
    await setPaused(false);
    for (const key of ['enabled', 'schedule-automatic', 'schedule-from', 'schedule-to', 'temperature']) settings.reset(key);
  }
}
