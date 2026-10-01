import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const COLOR = 'com.lantharos.Settings.NightLight';
const COLOR_PATH = '/com/lantharos/Settings/NightLight';
const NEUTRAL = 6500;
const WARM = 3000;
const SETTLE_MS = 8000;

function property(name) {
  return Gio.DBus.session.call(COLOR, COLOR_PATH, 'org.freedesktop.DBus.Properties', 'Get',
    new GLib.Variant('(ss)', [COLOR, name]), new GLib.VariantType('(v)'), Gio.DBusCallFlags.NONE, -1, null)
    .then(reply => reply.recursiveUnpack()[0]);
}

function setPaused(paused) {
  return Gio.DBus.session.call(COLOR, COLOR_PATH, 'org.freedesktop.DBus.Properties', 'Set',
    new GLib.Variant('(ssv)', [COLOR, 'DisabledUntilTomorrow', new GLib.Variant('b', paused)]), null, Gio.DBusCallFlags.NONE, -1, null);
}

async function settlesOn(pause, active, temperature) {
  for (let waited = 0; waited < SETTLE_MS; waited += 200) {
    if (await property('NightLightActive') === active && await property('Temperature') === temperature) return true;
    await pause(200);
  }
  return false;
}

export async function checkNightLight({pause}) {
  const require = (condition, label) => {
    if (!condition) throw new Error(`Kestrel night light check failed: ${label}`);
    console.log(`Kestrel night light check: ${label}`);
  };
  const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel.night-light'});
  const now = GLib.DateTime.new_now_local();
  const hour = now.get_hour() + now.get_minute() / 60;
  const window = (from, to) => {
    settings.set_double('schedule-from', (hour + from + 24) % 24);
    settings.set_double('schedule-to', (hour + to + 24) % 24);
  };
  try {
    settings.set_boolean('schedule-automatic', false);
    settings.set_uint('temperature', WARM);
    window(-2, 2);
    settings.set_boolean('enabled', true);
    require(await settlesOn(pause, true, WARM), 'the screen warms up during the night light hours');

    await setPaused(true);
    require(await settlesOn(pause, true, NEUTRAL) && await property('DisabledUntilTomorrow'), 'pausing until tomorrow brings back neutral colors');

    await setPaused(false);
    require(await settlesOn(pause, true, WARM), 'resuming brings the warmth back');

    window(3, 5);
    require(await settlesOn(pause, false, NEUTRAL), 'the night light stays off outside its hours');

    window(-2, 2);
    require(await settlesOn(pause, true, WARM), 'the night light turns on when its hours begin');
    settings.set_boolean('enabled', false);
    require(await settlesOn(pause, false, NEUTRAL), 'turning the night light off restores neutral colors');
  } finally {
    await setPaused(false);
    for (const key of ['enabled', 'schedule-automatic', 'schedule-from', 'schedule-to', 'temperature']) settings.reset(key);
  }
}
