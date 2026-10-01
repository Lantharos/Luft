import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const BACKEND = 'org.freedesktop.impl.portal.desktop.kestrel';
const PORTAL_PATH = '/org/freedesktop/portal/desktop';
const SHORTCUTS = 'org.freedesktop.impl.portal.GlobalShortcuts';
const REQUEST = '/org/freedesktop/portal/desktop/request/kestrel/shortcuts';

let sessions = 0;

function call(method, parameters, replyType) {
  return Gio.DBus.session.call(BACKEND, PORTAL_PATH, SHORTCUTS, method, parameters,
    replyType ? new GLib.VariantType(replyType) : null, Gio.DBusCallFlags.NONE, -1, null);
}

function triggers(reply) {
  const [response, results] = reply.recursiveUnpack();
  if (response !== 0) throw new Error(`The shortcuts request ended with ${response}`);
  return Object.fromEntries(results.shortcuts.map(([id, options]) => [id, options.trigger_description ?? null]));
}

async function session(appId) {
  const handle = `/org/freedesktop/portal/desktop/session/kestrel/shortcuts${++sessions}`;
  await call('CreateSession', new GLib.Variant('(oosa{sv})', [REQUEST, handle, appId, {}]), '(ua{sv})');
  return handle;
}

async function bind(handle, requested) {
  return triggers(await call('BindShortcuts', new GLib.Variant('(ooa(sa{sv})sa{sv})', [REQUEST, handle, requested.map(([id, description, trigger]) =>
    [id, {description: new GLib.Variant('s', description), preferred_trigger: new GLib.Variant('s', trigger)}]), '', {}]), '(ua{sv})'));
}

export async function checkShortcuts({pause, capture, pointer, keyboard, output}) {
  const require = (condition, label) => {
    if (!condition) throw new Error(`Kestrel shortcut check failed: ${label}`);
    console.log(`Kestrel shortcut check: ${label}`);
  };
  const click = async actor => {
    const [x, y] = actor.get_transformed_position();
    pointer.notify_absolute_motion(GLib.get_monotonic_time(), x + actor.width / 2, y + actor.height / 2);
    pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.PRESSED);
    pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.RELEASED);
    await pause(250);
  };
  const press = (...symbols) => {
    for (const symbol of symbols) keyboard.notify_keyval(GLib.get_monotonic_time(), symbol, Clutter.KeyState.PRESSED);
    for (const symbol of symbols.reverse()) keyboard.notify_keyval(GLib.get_monotonic_time(), symbol, Clutter.KeyState.RELEASED);
  };
  const descendants = actor => [actor, ...actor.get_children().flatMap(descendants)];
  const same = (actual, expected) => JSON.stringify(actual) === JSON.stringify(expected);

  new Gio.Settings({schema_id: 'com.lantharos.kestrel'}).reset('global-shortcuts');
  const discord = await session('discord');
  const voice = await bind(discord, [
    ['mute', 'Toggle mute', 'CTRL+ALT+m'],
    ['deafen', 'Toggle deafen', 'LOGO+v'],
    ['talk', 'Push to talk', 'a'],
  ]);
  require(voice.mute === 'Ctrl+Alt+M', 'free preferred shortcuts are accepted without asking');
  require(voice.deafen === null, 'shortcuts the shell already uses are left unassigned');
  require(voice.talk === null, 'shortcuts that would swallow typing are left unassigned');
  const obs = await session('com.obsproject.Studio');
  require((await bind(obs, [['mute', 'Mute desktop audio', 'CTRL+ALT+m']])).mute === null, 'apps cannot take shortcuts another app holds');
  const discordAgain = await session('discord');
  require((await bind(discordAgain, [['mute', 'Toggle mute', 'CTRL+ALT+x']])).mute === 'Ctrl+Alt+M', 'apps keep what they were given before');

  const signals = [];
  const subscription = Gio.DBus.session.signal_subscribe(BACKEND, SHORTCUTS, null, PORTAL_PATH, null, Gio.DBusSignalFlags.NONE,
    (_connection, _sender, _path, _iface, signal, parameters) => signals.push([signal, ...parameters.recursiveUnpack()]));
  try {
    keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Control_L, Clutter.KeyState.PRESSED);
    keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Alt_L, Clutter.KeyState.PRESSED);
    keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_m, Clutter.KeyState.PRESSED);
    await pause(150);
    keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_m, Clutter.KeyState.RELEASED);
    keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Alt_L, Clutter.KeyState.RELEASED);
    keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Control_L, Clutter.KeyState.RELEASED);
    await pause(250);
    const forDiscord = signals.filter(([, handle, id]) => id === 'mute' && (handle === discord || handle === discordAgain));
    require(forDiscord.some(([signal]) => signal === 'Activated') && forDiscord.some(([signal]) => signal === 'Deactivated'),
      'pressing and releasing a shortcut reaches the app');

    await call('ConfigureShortcuts', new GLib.Variant('(osa{sv})', [discordAgain, '', {}]), null);
    await pause(600);
    const dialog = descendants(global.stage).find(actor => actor.has_style_class_name?.('kestrel-shortcuts-dialog'));
    const keys = descendants(dialog).filter(actor => actor.has_style_class_name?.('kestrel-shortcut-key'));
    require(keys.length === 3 && keys[0].label === 'Ctrl+Alt+M' && keys[1].label === 'Not set', 'the shortcut dialog lists every shortcut');
    await click(keys[1]);
    press(Clutter.KEY_Super_L, Clutter.KEY_v);
    await pause(150);
    require(keys[1].label === 'Super+V is taken', 'the dialog refuses shortcuts the shell uses');
    press(Clutter.KEY_Control_L, Clutter.KEY_Shift_L, Clutter.KEY_d);
    await pause(150);
    require(keys[1].label === 'Ctrl+Shift+D', 'the dialog records a new shortcut');
    await capture(`${output}/shortcuts.png`);
    await click(descendants(dialog).find(actor => actor.label === 'Save'));
    await pause(200);
    const changed = signals.find(([signal, handle]) => signal === 'ShortcutsChanged' && handle === discord);
    require(changed?.[2].find(([id]) => id === 'deafen')?.[1].trigger_description === 'Ctrl+Shift+D', 'saved shortcuts are handed back to the app');
  } finally {
    Gio.DBus.session.signal_unsubscribe(subscription);
  }
  for (const handle of [discord, obs, discordAgain])
    await Gio.DBus.session.call(BACKEND, handle, 'org.freedesktop.impl.portal.Session', 'Close', null, null, Gio.DBusCallFlags.NONE, -1, null);
}
