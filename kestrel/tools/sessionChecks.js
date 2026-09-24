import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import Shell from 'gi://Shell';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {showSurfaceForCapture, dismissImmediately} from 'resource:///org/gnome/shell/ui/kestrelUi.js';

export async function checkSession({pause, capture, actorNamed, pointer, keyboard, output}) {
  const key = symbol => {
    keyboard.notify_keyval(GLib.get_monotonic_time(), symbol, Clutter.KeyState.PRESSED);
    keyboard.notify_keyval(GLib.get_monotonic_time(), symbol, Clutter.KeyState.RELEASED);
  };
  const require = (condition, label) => {
    if (!condition) throw new Error(`Kestrel session check failed: ${label}`);
    console.log(`Kestrel session check: ${label}`);
  };
  const call = (name, path, iface, method, args) => new Promise((resolve, reject) => {
    Gio.DBus.session.call(name, path, iface, method, args, null, Gio.DBusCallFlags.NONE, 5000, null,
      (connection, result) => { try { resolve(connection.call_finish(result)); } catch (error) { reject(error); } });
  });
  const secondary = Main.layoutManager.monitors.find(monitor => monitor !== Main.layoutManager.primaryMonitor);
  if (secondary) {
    pointer.notify_absolute_motion(GLib.get_monotonic_time(), secondary.x + 60, secondary.y + 60);
    pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_SECONDARY, Clutter.ButtonState.PRESSED);
    pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_SECONDARY, Clutter.ButtonState.RELEASED);
    await pause(200);
    const menu = actorNamed(global.stage, 'kestrel-context-menu');
    require(menu.visible && menu.x >= secondary.x && menu.x + menu.width <= secondary.x + secondary.width, 'desktop context menu stays on secondary monitor');
    key(Clutter.KEY_Escape);
    await pause(150);
  }
  const panel = actorNamed(global.stage, 'kestrel-panel');
  const start = actorNamed(global.stage, 'kestrel-start');
  showSurfaceForCapture('start');
  await pause(350);
  key(Clutter.KEY_Down);
  await pause(100);
  require(global.stage.get_key_focus() instanceof St.Button, 'search Down focuses an app');
  key(Clutter.KEY_Tab);
  await pause(100);
  require(start.contains(global.stage.get_key_focus()), 'Tab stays in Start');

  Main.sessionMode.pushMode('unlock-dialog');
  try {
    await pause(200);
    require(!panel.visible && !start.visible, 'lock mode hides panel and Start');
    global.display.emit('overlay-key');
    await pause(100);
    require(!start.visible, 'Super cannot open Start while locked');
  } finally {
    Main.sessionMode.popMode('unlock-dialog');
  }
  await pause(200);
  require(panel.visible, 'panel returns after leaving lock mode');
  for (const name of ['polkitAgent', 'keyring', 'networkAgent', 'automountManager'])
    require(!!Main.componentManager._allComponents[name], `${name} component loaded`);

  showSurfaceForCapture('start');
  await pause(350);
  const audio = ['org.gnome.Shell.AudioDeviceSelection', '/org/gnome/Shell/AudioDeviceSelection', 'org.gnome.Shell.AudioDeviceSelection'];
  await call(...audio, 'Open', new GLib.Variant('(as)', [['headphones', 'headset', 'microphone']]));
  await pause(200);
  require(!start.visible && Main.modalCount > 0, 'audio dialog dismisses Start and takes focus');
  await capture(`${output}/audio-device-dialog.png`);
  key(Clutter.KEY_Escape);
  await pause(250);
  require(Main.modalCount === 0, 'audio dialog cancels cleanly');

  const mount = ['org.gtk.MountOperationHandler', '/org/gtk/MountOperationHandler', 'org.Gtk.MountOperationHandler'];
  const request = call(...mount, 'AskPassword', new GLib.Variant('(sssssu)', ['kestrel-check', 'Unlock encrypted volume', 'drive-harddisk-symbolic', '', '', Gio.AskPasswordFlags.NEED_PASSWORD]));
  await pause(250);
  require(Main.modalCount > 0, 'encrypted volume password dialog opens');
  await capture(`${output}/volume-password-dialog.png`);
  key(Clutter.KEY_Escape);
  await request;
  await call(...mount, 'Close', null);
  await pause(250);
  require(Main.modalCount === 0, 'password dialog cancels cleanly');

  const app = Gio.Subprocess.new(['gjs', '-m', GLib.getenv('KESTREL_WINDOW_SCRIPT'), '--multiple'], Gio.SubprocessFlags.NONE);
  try {
    await pause(1000);
    const window = global.get_window_actors().map(actor => actor.meta_window).find(window => window.title === 'Kestrel window check 1');
    const runningApp = Shell.WindowTracker.get_default().get_window_app(window);
    const button = actorNamed(panel, `kestrel-app-${runningApp.id}`);
    const [x, y] = button.get_transformed_position();
    pointer.notify_absolute_motion(GLib.get_monotonic_time(), x + 20, y + 20);
    await pause(550);
    const previews = actorNamed(global.stage, 'kestrel-window-previews');
    require(previews.visible, 'taskbar hover opens live window previews');
    await capture(`${output}/window-previews.png`);
    dismissImmediately();
    keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Alt_L, Clutter.KeyState.PRESSED);
    key(Clutter.KEY_Tab);
    await pause(350);
    require(Main.modalCount > 0, 'Alt-Tab opens the window switcher');
    await capture(`${output}/window-switcher.png`);
    keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Alt_L, Clutter.KeyState.RELEASED);
    await pause(250);
    require(Main.modalCount === 0, 'Alt release accepts window selection');
    keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Control_L, Clutter.KeyState.PRESSED);
    await pause(100);
    keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Alt_L, Clutter.KeyState.PRESSED);
    key(Clutter.KEY_Tab);
    await pause(300);
    require(Main.modalCount > 0, 'Ctrl-Alt-Tab opens shell focus switching');
    key(Clutter.KEY_Escape);
    keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Alt_L, Clutter.KeyState.RELEASED);
    keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Control_L, Clutter.KeyState.RELEASED);
    await pause(200);
  } finally {
    app.force_exit();
    await pause(300);
  }
}
