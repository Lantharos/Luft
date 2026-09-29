import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const PROVIDER = 'org.gnome.Settings.GlobalShortcutsProvider';
const PROVIDER_PATH = '/org/gnome/Settings/GlobalShortcutsProvider';

function call(method, parameters) {
  return Gio.DBus.session.call(PROVIDER, PROVIDER_PATH, PROVIDER, method, parameters,
    new GLib.VariantType('(a(sa{sv}))'), Gio.DBusCallFlags.NONE, -1, null)
    .then(reply => Object.fromEntries(reply.recursiveUnpack()[0].map(([id, options]) => [id, options.shortcuts ?? []])));
}

function bind(appId, requested) {
  return call('BindShortcuts', new GLib.Variant('(ssa(sa{sv}))', [appId, '', requested.map(([id, description, trigger]) =>
    [id, {description: new GLib.Variant('s', description), preferred_trigger: new GLib.Variant('s', trigger)}])]));
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
  const voice = await bind('discord', [
    ['mute', 'Toggle mute', '<ctrl><alt>m'],
    ['deafen', 'Toggle deafen', '<super>v'],
    ['talk', 'Push to talk', 'a'],
  ]);
  require(same(voice.mute, ['<ctrl><alt>m']), 'free preferred shortcuts are accepted without asking');
  require(same(voice.deafen, []), 'shortcuts the shell already uses are left unassigned');
  require(same(voice.talk, []), 'shortcuts that would swallow typing are left unassigned');
  require(same((await bind('com.obsproject.Studio', [['mute', 'Mute desktop audio', '<ctrl><alt>m']])).mute, []), 'apps cannot take shortcuts another app holds');
  require(same((await bind('discord', [['mute', 'Toggle mute', '<ctrl><alt>x']])).mute, ['<ctrl><alt>m']), 'apps keep what they were given before');

  const configured = call('ConfigureShortcuts', new GLib.Variant('(ss)', ['discord', '']));
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
  require(same((await configured).deafen, ['<Control><Shift>d']), 'saved shortcuts are handed back to the app');
}
