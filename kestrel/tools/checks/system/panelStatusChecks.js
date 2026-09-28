import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const SIGTERM = 15;

export async function checkPanelStatus({pause, capture, actorNamed, pointer, output}) {
  const require = (condition, label) => {
    if (!condition) throw new Error(`Kestrel panel status check failed: ${label}`);
    console.log(`Kestrel panel status check: ${label}`);
  };
  const click = async actor => {
    const [x, y] = actor.get_transformed_position();
    pointer.notify_absolute_motion(GLib.get_monotonic_time(), x + actor.width / 2, y + actor.height / 2);
    pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.PRESSED);
    pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.RELEASED);
    await pause(400);
  };
  const descendants = actor => [actor, ...actor.get_children().flatMap(descendants)];
  const showsIcon = (actor, name) => descendants(actor).some(child => child.visible && child.icon_name === name);

  const privacy = actorNamed(global.stage, 'kestrel-privacy');
  const menu = actorNamed(global.stage, 'kestrel-context-menu');
  require(!privacy.visible, 'the privacy button stays hidden while nothing is in use');
  const sharing = Gio.Subprocess.new(['gjs', '-c', `
    const {Gio, GLib} = imports.gi;
    const call = (path, iface, method, args, type) => Gio.DBus.session.call_sync('org.gnome.Mutter.ScreenCast', path, iface, method, args,
      type ? new GLib.VariantType(type) : null, Gio.DBusCallFlags.NONE, -1, null);
    const [session] = call('/org/gnome/Mutter/ScreenCast', 'org.gnome.Mutter.ScreenCast', 'CreateSession',
      new GLib.Variant('(a{sv})', [{}]), '(o)').deep_unpack();
    call(session, 'org.gnome.Mutter.ScreenCast.Session', 'Start', null, null);
    new GLib.MainLoop(null, false).run();`], Gio.SubprocessFlags.NONE);
  const inhibitor = Gio.Subprocess.new(['gjs', '-m', GLib.getenv('KESTREL_SESSION_CLIENT_SCRIPT'), '--inhibit'], Gio.SubprocessFlags.NONE);
  try {
    await pause(1200);
    const panel = actorNamed(global.stage, 'kestrel-panel');
    require(privacy.visible && showsIcon(privacy, 'screen-shared-symbolic'), 'sharing the screen shows the privacy button');
    require(showsIcon(actorNamed(panel, 'Quick settings'), 'view-reveal-symbolic'), 'apps keeping the screen awake show an eye');
    await capture(`${output}/privacy.png`);

    await click(privacy);
    require(menu.visible && !!actorNamed(menu, 'Stop sharing the screen'), 'the privacy button lists what is in use');
    await capture(`${output}/privacy-menu.png`);
    await click(actorNamed(menu, 'Stop sharing the screen'));
    await pause(300);
    require(!privacy.visible, 'stopping the share hides the privacy button');

    inhibitor.send_signal(SIGTERM);
    await pause(500);
    require(!showsIcon(panel, 'view-reveal-symbolic'), 'the eye goes away when the app lets the screen sleep');
  } finally {
    sharing.force_exit();
    inhibitor.force_exit();
  }
}
