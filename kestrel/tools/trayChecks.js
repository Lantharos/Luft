import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

export async function checkTray({pause, capture, actorNamed, pointer, output}) {
  const require = (condition, label) => {
    if (!condition) throw new Error(`Kestrel tray check failed: ${label}`);
    console.log(`Kestrel tray check: ${label}`);
  };
  const click = async (actor, button = Clutter.BUTTON_PRIMARY) => {
    const [x, y] = actor.get_transformed_position();
    pointer.notify_absolute_motion(GLib.get_monotonic_time(), x + actor.width / 2, y + actor.height / 2);
    pointer.notify_button(GLib.get_monotonic_time(), button, Clutter.ButtonState.PRESSED);
    pointer.notify_button(GLib.get_monotonic_time(), button, Clutter.ButtonState.RELEASED);
    await pause(300);
  };
  const descendants = actor => [actor, ...actor.get_children().flatMap(descendants)];

  const app = Gio.Subprocess.new(['gjs', '-m', GLib.getenv('KESTREL_TRAY_SCRIPT')], Gio.SubprocessFlags.NONE);
  try {
    await pause(1000);
    const tray = actorNamed(global.stage, 'kestrel-tray');
    const item = tray.get_first_child();
    require(item?.visible && item.accessible_name === 'Chatter', 'tray shows an app icon with its title');
    await capture(`${output}/tray.png`);

    await click(item);
    require(item.accessible_name === 'Chatter open', 'clicking a tray icon activates the app');

    const menu = actorNamed(global.stage, 'kestrel-context-menu');
    await click(item, Clutter.BUTTON_SECONDARY);
    require(menu.visible && !!actorNamed(menu, 'Open Chatter') && !actorNamed(menu, 'Hidden'), 'tray menu lists the visible app actions');
    await click(actorNamed(menu, 'Status'));
    require(!!actorNamed(menu, 'Away') && !!actorNamed(menu, 'Back'), 'tray submenus open in place');
    await capture(`${output}/tray-menu.png`);
    await click(actorNamed(menu, 'Back'));
    await click(actorNamed(menu, 'Mute'));
    await pause(200);
    require(!menu.visible, 'choosing a tray action closes the menu');
    await click(item, Clutter.BUTTON_SECONDARY);
    const checked = descendants(actorNamed(menu, 'Mute')).some(actor => actor.icon_name === 'object-select-symbolic');
    require(checked, 'tray menu reflects toggled items');
    await click(actorNamed(menu, 'Quit'));
  } finally {
    app.force_exit();
  }
  await pause(500);
  require(!actorNamed(global.stage, 'kestrel-tray').get_n_children(), 'tray icons leave with their app');
}
