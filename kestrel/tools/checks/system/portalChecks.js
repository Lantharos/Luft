import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {checkAppPortals} from '../portal/appChecks.js';
import {checkSystemPortals} from '../portal/systemChecks.js';

const BACKEND = 'org.freedesktop.impl.portal.desktop.kestrel';
const PORTAL_PATH = '/org/freedesktop/portal/desktop';

function call(iface, method, parameters, replyType) {
  return Gio.DBus.session.call(BACKEND, PORTAL_PATH, iface, method, parameters, new GLib.VariantType(replyType),
    Gio.DBusCallFlags.NONE, -1, null);
}

export async function checkPortal({pause, capture, output, pointer}) {
  const require = (condition, label) => {
    if (!condition) throw new Error(`Kestrel portal check failed: ${label}`);
    console.log(`Kestrel portal check: ${label}`);
  };
  const interfaceSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  const colorScheme = interfaceSettings.get_string('color-scheme');
  const readAppearance = async () =>
    (await call('org.freedesktop.impl.portal.Settings', 'ReadAll', new GLib.Variant('(as)', [['org.freedesktop.appearance']]), '(a{sa{sv}})'))
      .recursiveUnpack()[0]['org.freedesktop.appearance'];

  const appearance = await readAppearance();
  const accent = appearance['accent-color'];
  require(accent?.length === 3 && accent.every(channel => channel >= 0 && channel <= 1), 'apps get the wallpaper accent color');

  const changes = [];
  const subscription = Gio.DBus.session.signal_subscribe(BACKEND, 'org.freedesktop.impl.portal.Settings', 'SettingChanged', PORTAL_PATH, null,
    Gio.DBusSignalFlags.NONE, (_connection, _sender, _path, _iface, _signal, parameters) => changes.push(parameters.recursiveUnpack()));
  try {
    interfaceSettings.set_string('color-scheme', 'prefer-light');
    await pause(300);
    require((await readAppearance())['color-scheme'] === 2 && changes.some(([, key, value]) => key === 'color-scheme' && value === 2),
      'apps follow the light and dark style');
  } finally {
    interfaceSettings.set_string('color-scheme', colorScheme);
    Gio.DBus.session.signal_unsubscribe(subscription);
  }

  const [response, results] = (await call('org.freedesktop.impl.portal.Screenshot', 'Screenshot',
    new GLib.Variant('(ossa{sv})', ['/org/freedesktop/portal/desktop/request/kestrel/check', 'org.gnome.TextEditor', '', {}]), '(ua{sv})'))
    .recursiveUnpack();
  const file = results.uri ? Gio.File.new_for_uri(results.uri) : null;
  require(response === 0 && !!file?.query_exists(null), 'apps can take a screenshot');
  file.delete(null);
  await pause(300);

  await checkAppPortals({pause, capture, output, pointer});
  await checkSystemPortals({pause, capture, output, pointer});
}
