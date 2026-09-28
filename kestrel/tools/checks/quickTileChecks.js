import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import {toggleSurface} from 'resource:///org/gnome/shell/ui/kestrelUi.js';

const SIGTERM = 15;

export async function checkQuickTiles({pause, capture, actorNamed, pointer, output}) {
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
  const shellSettings = new Gio.Settings({schema_id: 'org.gnome.shell'});
  const interfaceSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  const grid = () => withClass(quick, 'kestrel-control')[0].get_parent();
  const center = actor => {
    const [x, y] = actor.get_transformed_position();
    return [x + actor.width / 2, y + actor.height / 2];
  };
  const moveTo = (x, y) => pointer.notify_absolute_motion(GLib.get_monotonic_time(), x, y);
  const button = (number, state) => pointer.notify_button(GLib.get_monotonic_time(), number, state);
  const clickAt = async (x, y, number = Clutter.BUTTON_PRIMARY) => {
    moveTo(x, y);
    button(number, Clutter.ButtonState.PRESSED);
    button(number, Clutter.ButtonState.RELEASED);
    await pause(300);
  };
  const menu = actorNamed(global.stage, 'kestrel-context-menu');
  const surfaceCorner = () => {
    const [x, y] = quick.get_transformed_position();
    return [x + 20, y + 8];
  };
  const colorScheme = interfaceSettings.get_string('color-scheme');

  const services = Gio.Subprocess.new(['gjs', '-m', GLib.getenv('KESTREL_LAPTOP_SCRIPT')], Gio.SubprocessFlags.NONE);
  const session = Gio.Subprocess.new(['gjs', '-m', GLib.getenv('KESTREL_INHIBITOR_SCRIPT')], Gio.SubprocessFlags.NONE);
  try {
    await pause(1500);
    toggleSurface('quick');
    await pause(450);
    require(['Keep Awake', 'Dark Style', 'Airplane Mode', 'Keyboard Backlight'].every(title => tile(title)?.visible), 'quick settings show every available tile');
    await clickAt(...surfaceCorner(), Clutter.BUTTON_SECONDARY);
    require(!menu.visible, 'quick settings has no context menu until the layout is customized');
    await capture(`${output}/quick-settings-tiles.png`);

    const keepAwake = tile('Keep Awake');
    keepAwake.emit('clicked', 1);
    await pause(400);
    require(keepAwake.checked && statusShows('view-reveal-symbolic'), 'keep awake holds the session awake and shows the eye');
    keepAwake.emit('clicked', 1);
    await pause(400);
    require(!keepAwake.checked && !statusShows('view-reveal-symbolic'), 'turning keep awake off lets the session sleep');
    withClass(keepAwake, 'kestrel-control-more')[0].emit('clicked', 1);
    await pause(500);
    const hour = actorNamed(quick, '1 Hour') ?? descendants(quick).find(actor => actor.visible && actor.label_actor?.text === '1 Hour');
    require(!!hour?.visible, 'keep awake offers how long to stay awake');
    const [, hourY] = hour.get_transformed_position();
    require(keepAwake.width === grid().width && hourY > keepAwake.get_transformed_position()[1] + keepAwake.height,
      'options open inline beneath a full-width tile');
    require(quick.visible && !actorNamed(quick, 'Back to quick settings'), 'options stay in the same view');
    const scroller = withClass(quick, 'kestrel-app-scroll')[0];
    require(scroller.vadjustment.upper > scroller.vadjustment.page_size && hourY < scroller.get_transformed_position()[1] + scroller.height,
      'long quick settings scroll to show the open options');
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
    await pause(500);
    await capture(`${output}/keyboard-backlight-menu.png`);
    withClass(keyboard, 'kestrel-control-more')[0].emit('clicked', 1);
    await pause(500);
    require(keyboard.width < grid().width / 2 + 1, 'closing options returns the tile to the grid');

    const volume = descendants(quick).find(actor => actor.slider && actor.menu && actor.menuEnabled);
    volume._menuButton.emit('clicked', 1);
    await pause(400);
    require(volume.menu.isOpen, 'the device chevron opens the device list');
    volume._menuButton.emit('clicked', 1);
    await pause(400);
    require(!volume.menu.isOpen, 'the same chevron closes it again');

    const [first, second] = grid().get_children().filter(actor => actor.has_style_class_name?.('kestrel-control') && actor.visible)
      .sort((a, b) => a.y - b.y || a.x - b.x);
    const [fromX, fromY] = center(first);
    const [toX, toY] = center(second);
    moveTo(fromX, fromY);
    button(Clutter.BUTTON_PRIMARY, Clutter.ButtonState.PRESSED);
    for (let step = 1; step <= 12; step++) {
      moveTo(fromX + (toX - fromX) * step / 12, fromY + (toY - fromY) * step / 12);
      await pause(16);
    }
    await pause(200);
    button(Clutter.BUTTON_PRIMARY, Clutter.ButtonState.RELEASED);
    await pause(450);
    require(first.x > second.x && shellSettings.get_strv('kestrel-quick-tile-order').length > 0, 'dragging a tile moves it and remembers the order');

    await clickAt(...center(dark), Clutter.BUTTON_SECONDARY);
    await clickAt(...center(actorNamed(menu, 'Remove')));
    await pause(150);
    require(!dark.get_parent() && shellSettings.get_strv('kestrel-quick-tiles-removed').includes('dark-style-0'), 'tiles can be removed from Quick Settings');
    await clickAt(...surfaceCorner(), Clutter.BUTTON_SECONDARY);
    for (const label of ['Add', 'Dark Style'])
      await clickAt(...center(actorNamed(menu, label)));
    await pause(200);
    require(dark.get_parent() === grid() && dark.visible, 'removed tiles can be added back');
    toggleSurface('quick');
    await pause(300);
  } finally {
    shellSettings.reset('kestrel-quick-tile-order');
    shellSettings.reset('kestrel-quick-tiles-removed');
    interfaceSettings.set_string('color-scheme', colorScheme);
    session.send_signal(SIGTERM);
    services.force_exit();
  }
  await pause(300);
}
