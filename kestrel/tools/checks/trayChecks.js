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
    require(tray?.visible && tray.child.get_n_children() === 1, 'tray shows one grouped button with an app preview');
    await capture(`${output}/tray.png`);

    const menu = actorNamed(global.stage, 'kestrel-context-menu');
    const openApp = async () => {
      await click(tray);
      await click(actorNamed(menu, 'Chatter'));
    };
    await click(tray);
    require(menu.visible && !!actorNamed(menu, 'Chatter'), 'the tray panel lists apps by name');
    await click(actorNamed(menu, 'Chatter'));
    require(!!actorNamed(menu, 'Open Chatter') && !!actorNamed(menu, 'Mute') && !actorNamed(menu, 'Hidden'), 'an app opens into its own actions');
    await click(actorNamed(menu, 'Status'));
    require(!!actorNamed(menu, 'Away') && !!actorNamed(menu, 'Back'), 'tray submenus open in place');
    await capture(`${output}/tray-menu.png`);
    await click(actorNamed(menu, 'Back'));
    await click(actorNamed(menu, 'Mute'));
    await pause(200);
    require(!menu.visible, 'choosing a tray action closes the menu');
    await openApp();
    const checked = descendants(actorNamed(menu, 'Mute')).some(actor => actor.icon_name === 'object-select-symbolic');
    require(checked, 'tray menu reflects toggled items');
    await click(actorNamed(menu, 'Open Chatter'));
    await pause(300);
    await click(tray);
    require(!!actorNamed(menu, 'Chatter open'), 'Open activates the app');
    await click(actorNamed(menu, 'Chatter open'));
    await click(actorNamed(menu, 'Quit'));
  } finally {
    app.force_exit();
  }
  await pause(500);
  require(!actorNamed(global.stage, 'kestrel-tray').visible, 'the tray hides when its last app exits');
}
