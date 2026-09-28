import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

export async function checkTaskbar({pause, capture, actorNamed, pointer, output}) {
  const require = (condition, label) => {
    if (!condition) throw new Error(`Kestrel taskbar check failed: ${label}`);
    console.log(`Kestrel taskbar check: ${label}`);
  };
  const descendants = actor => [actor, ...actor.get_children().flatMap(descendants)];
  const withClass = (root, name) => descendants(root).find(actor => actor.has_style_class_name?.(name));
  const move = (x, y) => pointer.notify_absolute_motion(GLib.get_monotonic_time(), x, y);

  const panel = actorNamed(global.stage, 'kestrel-panel');
  const button = descendants(panel).find(actor => actor.name?.startsWith('kestrel-app-'));
  const appId = button.name.replace('kestrel-app-', '');
  const launcher = Gio.Subprocess.new(['gjs', '-c', `
    const {Gio, GLib} = imports.gi;
    Gio.DBus.session.emit_signal(null, '/check', 'com.canonical.Unity.LauncherEntry', 'Update',
      new GLib.Variant('(sa{sv})', ['application://${appId}', {
        'count': new GLib.Variant('x', 3), 'count-visible': new GLib.Variant('b', true),
        'progress': new GLib.Variant('d', 0.5), 'progress-visible': new GLib.Variant('b', true),
        'urgent': new GLib.Variant('b', true),
      }]));
    new GLib.MainLoop(null, false).run();`], Gio.SubprocessFlags.NONE);
  const windows = Gio.Subprocess.new(['gjs', '-m', GLib.getenv('KESTREL_WINDOW_SCRIPT'), '--multiple'], Gio.SubprocessFlags.NONE);
  try {
    await pause(1500);
    const badge = withClass(button, 'kestrel-task-badge');
    const fill = withClass(button, 'kestrel-task-progress-fill');
    require(badge.visible && badge.text === '3', 'apps show their unread count');
    require(fill.get_parent().visible && Math.abs(fill.width - fill.get_parent().width / 2) <= 1, 'apps show their progress');
    require(withClass(button, 'kestrel-task-attention').visible, 'apps asking for attention are highlighted');
    await capture(`${output}/taskbar-indicators.png`);

    const peek = withClass(panel, 'kestrel-peek');
    const actors = () => global.get_window_actors().filter(actor => actor.meta_window.title.startsWith('Kestrel window check'));
    const [x, y] = peek.get_transformed_position();
    move(x + peek.width / 2, y + peek.height / 2);
    await pause(900);
    require(actors().every(actor => actor.opacity === 0), 'hovering the panel edge peeks at the desktop');
    move(20, 20);
    await pause(400);
    require(actors().every(actor => actor.opacity === 255), 'leaving the edge brings windows back');
    peek.emit('clicked', Clutter.BUTTON_PRIMARY);
    await pause(600);
    require(actors().every(actor => actor.meta_window.minimized), 'clicking the edge shows the desktop');
    peek.emit('clicked', Clutter.BUTTON_PRIMARY);
    await pause(600);
    require(actors().every(actor => !actor.meta_window.minimized), 'clicking again restores the windows');
  } finally {
    windows.force_exit();
    launcher.force_exit();
  }
  await pause(500);
  require(!withClass(button, 'kestrel-task-badge').visible, 'indicators clear when the app exits');
}
