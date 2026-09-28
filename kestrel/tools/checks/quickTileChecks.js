import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import {toggleSurface} from 'resource:///org/gnome/shell/ui/kestrelUi.js';

const SIGTERM = 15;

export async function checkQuickTiles({pause, capture, actorNamed, output}) {
  const require = (condition, label) => {
    if (!condition) throw new Error(`Kestrel quick tile check failed: ${label}`);
    console.log(`Kestrel quick tile check: ${label}`);
  };
  const descendants = actor => [actor, ...actor.get_children().flatMap(descendants)];
  const withClass = (root, name) => descendants(root).filter(actor => actor.has_style_class_name?.(name));
  const quick = actorNamed(global.stage, 'kestrel-quick-settings');
  const tile = title => withClass(quick, 'kestrel-control').find(control => control.title === title);
  const subtitle = control => withClass(control, 'kestrel-control-subtitle')[0].text;
  const panel = actorNamed(global.stage, 'kestrel-panel');
  const statusShows = name => descendants(actorNamed(panel, 'Quick settings')).some(actor => actor.visible && actor.icon_name === name);
  const interfaceSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  const colorScheme = interfaceSettings.get_string('color-scheme');

  const services = Gio.Subprocess.new(['gjs', '-m', GLib.getenv('KESTREL_LAPTOP_SCRIPT')], Gio.SubprocessFlags.NONE);
  const session = Gio.Subprocess.new(['gjs', '-m', GLib.getenv('KESTREL_INHIBITOR_SCRIPT')], Gio.SubprocessFlags.NONE);
  try {
    await pause(1500);
    toggleSurface('quick');
    await pause(450);
    require(['Keep Awake', 'Dark Style', 'Airplane Mode', 'Keyboard Backlight'].every(title => tile(title)?.visible), 'quick settings show every available tile');
    await capture(`${output}/quick-settings-tiles.png`);

    const keepAwake = tile('Keep Awake');
    keepAwake.emit('clicked', 1);
    await pause(400);
    require(keepAwake.checked && statusShows('view-reveal-symbolic'), 'keep awake holds the session awake and shows the eye');
    keepAwake.emit('clicked', 1);
    await pause(400);
    require(!keepAwake.checked && !statusShows('view-reveal-symbolic'), 'turning keep awake off lets the session sleep');
    withClass(keepAwake, 'kestrel-control-more')[0].emit('clicked', 1);
    await pause(400);
    const hour = actorNamed(quick, '1 Hour') ?? descendants(quick).find(actor => actor.visible && actor.label_actor?.text === '1 Hour');
    require(!!hour?.visible, 'keep awake offers how long to stay awake');
    await capture(`${output}/keep-awake-menu.png`);
    hour.activate(null);
    await pause(400);
    require(keepAwake.checked && subtitle(keepAwake).startsWith('Until '), 'a timed keep awake shows when it ends');
    keepAwake.emit('clicked', 1);
    await pause(300);

    const airplane = tile('Airplane Mode');
    airplane.emit('clicked', 1);
    await pause(400);
    require(airplane.checked && statusShows('airplane-mode-symbolic'), 'airplane mode turns on and shows in the panel');
    airplane.emit('clicked', 1);
    await pause(400);
    require(!airplane.checked && !statusShows('airplane-mode-symbolic'), 'airplane mode turns off');

    const keyboard = tile('Keyboard Backlight');
    require(keyboard.checked, 'the keyboard tile reflects a lit backlight');
    keyboard.emit('clicked', 1);
    await pause(400);
    require(!keyboard.checked, 'the keyboard tile turns the backlight off');

    const dark = tile('Dark Style');
    const wasDark = dark.checked;
    dark.emit('clicked', 1);
    await pause(400);
    require(dark.checked !== wasDark && interfaceSettings.get_string('color-scheme') === (wasDark ? 'default' : 'prefer-dark'), 'dark style switches the app color scheme');
    withClass(keyboard, 'kestrel-control-more')[0].emit('clicked', 1);
    await pause(400);
    await capture(`${output}/keyboard-backlight-menu.png`);
    toggleSurface('quick');
    await pause(300);
  } finally {
    interfaceSettings.set_string('color-scheme', colorScheme);
    session.send_signal(SIGTERM);
    services.force_exit();
  }
  await pause(300);
}
