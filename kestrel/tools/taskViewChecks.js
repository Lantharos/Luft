import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

export async function checkTaskView({pause, capture, actorNamed, pointer, keyboard, output}) {
  const require = (condition, label) => {
    if (!condition) throw new Error(`Kestrel task view check failed: ${label}`);
    console.log(`Kestrel task view check: ${label}`);
  };
  const center = actor => {
    const [x, y] = actor.get_transformed_position();
    return [x + actor.width / 2, y + actor.height / 2];
  };
  const click = async actor => {
    pointer.notify_absolute_motion(GLib.get_monotonic_time(), ...center(actor));
    pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.PRESSED);
    pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.RELEASED);
    await pause(350);
  };
  const drag = async (source, target) => {
    const [startX, startY] = center(source);
    const [endX, endY] = center(target);
    pointer.notify_absolute_motion(GLib.get_monotonic_time(), startX, startY);
    pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.PRESSED);
    await pause(80);
    for (let step = 1; step <= 16; step++) {
      pointer.notify_absolute_motion(GLib.get_monotonic_time(), startX + (endX - startX) * step / 16, startY + (endY - startY) * step / 16);
      await pause(25);
    }
    await pause(150);
    pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.RELEASED);
    await pause(400);
  };
  const superTab = async () => {
    keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Super_L, Clutter.KeyState.PRESSED);
    keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Tab, Clutter.KeyState.PRESSED);
    keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Tab, Clutter.KeyState.RELEASED);
    keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Super_L, Clutter.KeyState.RELEASED);
    await pause(400);
  };

  const app = Gio.Subprocess.new(['gjs', '-m', GLib.getenv('KESTREL_WINDOW_SCRIPT'), '--multiple'], Gio.SubprocessFlags.NONE);
  const manager = global.workspace_manager;
  try {
    await pause(1500);
    const view = actorNamed(global.stage, 'kestrel-task-view');
    await superTab();
    const cards = () => view.get_first_child().get_children();
    require(view.visible && cards().length === 2, 'Super+Tab shows every window on the desktop');
    const desktops = () => view.get_last_child().get_children();
    require(desktops().length === 2 && desktops()[0].has_style_pseudo_class('checked'), 'desktops appear with the current one marked');
    await capture(`${output}/task-view.png`);

    const moved = cards()[1];
    const window = global.get_window_actors().map(actor => actor.meta_window).find(candidate => candidate.title === moved.accessible_name);
    await drag(moved, desktops()[1]);
    await pause(300);
    require(window.get_workspace().index() === 1 && cards().length === 1 && desktops().length === 3,
      'dragging a window onto a desktop moves it there');

    await click(desktops()[1]);
    await pause(200);
    require(manager.get_active_workspace_index() === 1 && view.visible && cards()[0]?.accessible_name === window.title,
      'choosing a desktop switches to it and shows its windows');
    await capture(`${output}/task-view-desktop.png`);

    await click(cards()[0]);
    require(!view.visible && global.display.focus_window === window, 'choosing a window focuses it and closes the view');
  } finally {
    app.force_exit();
    manager.get_workspace_by_index(0).activate(global.get_current_time());
  }
  await pause(500);
}
