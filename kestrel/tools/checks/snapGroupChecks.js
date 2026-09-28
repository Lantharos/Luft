import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Mtk from 'gi://Mtk';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export async function checkSnapGroups({pause}) {
  const require = (condition, label) => {
    if (!condition) throw new Error(`Kestrel snap group check failed: ${label}`);
    console.log(`Kestrel snap group check: ${label}`);
  };
  const script = GLib.getenv('KESTREL_WINDOW_SCRIPT');
  const pair = Gio.Subprocess.new(['gjs', '-m', script, '--multiple'], Gio.SubprocessFlags.NONE);
  const cover = Gio.Subprocess.new(['gjs', '-c', `
    imports.gi.versions.Gtk = '4.0';
    const {GLib, Gtk} = imports.gi;
    Gtk.init();
    new Gtk.Window({title: 'Kestrel cover window', default_width: 500, default_height: 400}).present();
    new GLib.MainLoop(null, false).run();`], Gio.SubprocessFlags.NONE);
  try {
    await pause(1500);
    const windows = global.get_window_actors().map(actor => actor.meta_window);
    const [left, right] = ['Kestrel window check 1', 'Kestrel window check 2'].map(title => windows.find(window => window.title === title));
    const other = windows.find(window => window.title === 'Kestrel cover window');
    const area = Main.layoutManager.getWorkAreaForMonitor(left.get_monitor());
    const half = Math.floor(area.width / 2);
    Main.wm.snapWindow(left, new Mtk.Rectangle({x: area.x, y: area.y, width: half, height: area.height}));
    Main.wm.snapWindow(right, new Mtk.Rectangle({x: area.x + half, y: area.y, width: area.width - half, height: area.height}));
    await pause(400);
    other.activate(global.get_current_time());
    other.maximize();
    await pause(400);
    const above = (a, b) => {
      const order = global.display.sort_windows_by_stacking([a, b]);
      return order.indexOf(a) > order.indexOf(b);
    };
    require(above(other, left) && above(other, right), 'another window covers the snapped pair');
    Main.wm.activateWithSnapGroup(left);
    await pause(300);
    require(global.display.focus_window === left && above(left, other) && above(right, other), 'activating a snapped window brings its partner along');
    other.activate(global.get_current_time());
    other.unmaximize();
    await pause(300);
    Main.wm.activateWithSnapGroup(other);
    await pause(200);
    require(above(other, left) && above(other, right), 'unsnapped windows activate on their own');
  } finally {
    pair.force_exit();
    cover.force_exit();
  }
  await pause(500);
}
