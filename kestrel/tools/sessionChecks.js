import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import Shell from 'gi://Shell';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {toggleSurface, dismissImmediately} from 'resource:///org/gnome/shell/ui/kestrelUi.js';

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
  toggleSurface('start');
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

  toggleSurface('start');
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

  const media = Gio.Subprocess.new(['gjs', '-m', GLib.getenv('KESTREL_MEDIA_SCRIPT')], Gio.SubprocessFlags.NONE);
  try {
    await pause(1200);
    toggleSurface('notifications');
    await pause(450);
    const mediaCard = actorNamed(global.stage, 'kestrel-notifications').get_first_child();
    require(mediaCard.visible, 'media controls appear for a playing app');
    await capture(`${output}/media-controls.png`);
    actorNamed(mediaCard, 'Pause').emit('clicked', 1);
    await pause(400);
    require(!!actorNamed(mediaCard, 'Play'), 'media controls toggle playback');
    dismissImmediately();
  } finally {
    media.force_exit();
  }
  await pause(300);

  const endSession = ['org.gnome.Shell', '/org/gnome/SessionManager/EndSessionDialog', 'org.gnome.SessionManager.EndSessionDialog'];
  await call(...endSession, 'Open', new GLib.Variant('(uuuao)', [0, 0, 60, []]));
  await pause(350);
  require(Main.modalCount > 0, 'log out confirmation opens');
  await capture(`${output}/end-session-dialog.png`);
  await call(...endSession, 'Close', null);
  await pause(250);
  require(Main.modalCount === 0, 'log out confirmation closes');

  Main.osdWindowManager.showAll(new Gio.ThemedIcon({name: 'audio-volume-high-symbolic'}), null, 0.6, 1);
  await pause(200);
  await capture(`${output}/volume-osd.png`);
  Main.osdWindowManager.hideAll();
  await pause(200);
  await Main.screenshotUI.open();
  await pause(250);
  await capture(`${output}/screenshot-controls.png`);
  Main.screenshotUI.close(true);
  await pause(250);

  const app = Gio.Subprocess.new(['gjs', '-m', GLib.getenv('KESTREL_WINDOW_SCRIPT'), '--multiple'], Gio.SubprocessFlags.NONE);
  try {
    await pause(1000);
    const windows = global.get_window_actors().map(actor => actor.meta_window);
    const window = windows.find(window => window.title === 'Kestrel window check 1');
    for (const candidate of windows.filter(candidate => candidate.title.startsWith('Kestrel window check')))
      candidate.move_to_monitor(global.display.get_primary_monitor());
    await pause(400);
    require(global.workspace_manager.n_workspaces === 2, 'occupied workspace has one empty workspace');
    windows.find(window => window.title === 'Kestrel window check 2').change_workspace_by_index(1, false);
    await pause(400);
    require(global.workspace_manager.n_workspaces === 3, 'second occupied workspace adds one empty workspace');
    keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Super_L, Clutter.KeyState.PRESSED);
    await pause(80);
    key(Clutter.KEY_2);
    await pause(120);
    await capture(`${output}/workspace-slide.png`);
    keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Super_L, Clutter.KeyState.RELEASED);
    await pause(400);
    require(global.workspace_manager.get_active_workspace_index() === 1, 'Super+2 switches to workspace two');
    pointer.notify_absolute_motion(GLib.get_monotonic_time(), 120, panel.y + 24);
    pointer.notify_discrete_scroll(GLib.get_monotonic_time(), Clutter.ScrollDirection.DOWN, Clutter.ScrollSource.WHEEL);
    await pause(500);
    require(global.workspace_manager.get_active_workspace_index() === 2, 'panel scroll switches workspace');
    pointer.notify_absolute_motion(GLib.get_monotonic_time(), 120, 120);
    keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Super_L, Clutter.KeyState.PRESSED);
    await pause(80);
    pointer.notify_discrete_scroll(GLib.get_monotonic_time(), Clutter.ScrollDirection.UP, Clutter.ScrollSource.WHEEL);
    await pause(500);
    require(global.workspace_manager.get_active_workspace_index() === 1, 'Super+scroll switches workspace');
    keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Super_L, Clutter.KeyState.RELEASED);
    await pause(350);
    require(!actorNamed(global.stage, 'kestrel-start').visible, 'Super release after scrolling keeps Start closed');
    keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Super_L, Clutter.KeyState.PRESSED);
    key(Clutter.KEY_1);
    keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Super_L, Clutter.KeyState.RELEASED);
    await pause(500);
    dismissImmediately();

    window.activate(global.get_current_time());
    window.make_fullscreen();
    await pause(400);
    require(!panel.visible, 'panel stays below fullscreen windows');
    await capture(`${output}/fullscreen.png`);
    window.unmake_fullscreen();
    await pause(400);
    require(panel.visible, 'panel returns after fullscreen');
    const runningApp = Shell.WindowTracker.get_default().get_window_app(window);
    const button = actorNamed(panel, `kestrel-app-${runningApp.id}`);
    require(button.has_style_class_name('kestrel-app-focused'), 'focused app has persistent focus styling');
    const [hasIconGeometry, iconGeometry] = window.get_icon_geometry();
    const [buttonX, buttonY] = button.get_transformed_position();
    require(hasIconGeometry && iconGeometry.x === Math.round(buttonX) && iconGeometry.y === Math.round(buttonY),
      'windows minimize toward their taskbar button');
    window.minimize();
    await pause(250);
    window.activate(global.get_current_time());
    await pause(300);
    require(button.has_style_class_name('kestrel-app-focused'), 'app focus styling returns after minimize and activation');
    const dots = button.child.get_children().filter(actor => actor.has_style_class_name?.('kestrel-running-dot') && actor.visible);
    require(dots.length === 2, 'two app windows show two running dots');
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
    await pause(500);
    require(global.workspace_manager.n_workspaces === 1, 'empty workspaces collapse after windows close');
  }
}
