import GdkPixbuf from 'gi://GdkPixbuf';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import {toggleSurface} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

const KEYS = ['taskbar-alignment', 'taskbar-look', 'taskbar-style', 'taskbar-size', 'taskbar-auto-hide',
  'taskbar-show-pinned', 'taskbar-displays', 'taskbar-windows-per-display', 'taskbar-windows-per-workspace'];
const SECOND_APP = `
  imports.gi.versions.Gtk = '4.0';
  const {Gtk} = imports.gi;
  const app = new Gtk.Application({application_id: 'com.lantharos.Kestrel.WorkspaceCheck'});
  app.connect('activate', () => new Gtk.ApplicationWindow({application: app, title: 'Kestrel workspace check'}).present());
  app.run([]);`;
const HEIGHTS = {compact: 40, normal: 48, large: 56};
const FLOATING_MARGIN = 8;
const SETTLE = 450;
const SCHEME_SETTLE = 1500;
const CROP_HEIGHT = 120;

async function captureBottom(path, monitor) {
  const stream = Gio.MemoryOutputStream.new_resizable();
  const screenshot = new Shell.Screenshot();
  await new Promise((resolve, reject) => screenshot.screenshot(false, stream, (source, result) => {
    try {
      source.screenshot_finish(result);
      resolve();
    } catch (error) {
      reject(error);
    }
  }));
  stream.close(null);
  const frame = GdkPixbuf.Pixbuf.new_from_stream(Gio.MemoryInputStream.new_from_bytes(stream.steal_as_bytes()), null);
  frame.new_subpixbuf(monitor.x, monitor.y + monitor.height - CROP_HEIGHT, monitor.width, CROP_HEIGHT).savev(path, 'png', [], []);
}

export async function checkTaskbarOptions({pause, actorNamed, pointer, output}) {
  const require = (condition, label) => {
    if (!condition) throw new Error(`Kestrel taskbar option check failed: ${label}`);
    console.log(`Kestrel taskbar option check: ${label}`);
  };
  const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
  const styles = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  const scheme = styles.get_string('color-scheme');
  const set = async (key, value) => {
    if (typeof value === 'boolean') settings.set_boolean(key, value);
    else settings.set_string(key, value);
    await pause(SETTLE);
  };
  const move = (x, y) => pointer.notify_absolute_motion(GLib.get_monotonic_time(), x, y);
  const monitor = Main.layoutManager.primaryMonitor;
  const panel = actorNamed(global.stage, 'kestrel-panel');
  const center = actorNamed(global.stage, 'kestrel-panel-center');
  const workArea = () => Main.layoutManager.getWorkAreaForMonitor(monitor.index);
  const bottomGap = () => monitor.y + monitor.height - workArea().y - workArea().height;
  const panelBox = () => {
    const [x, y] = panel.get_transformed_position();
    return {x, y, width: panel.width, height: panel.height};
  };
  const slots = () => actorNamed(panel, 'kestrel-panel-center').get_children()[1].get_children();

  try {
    require(bottomGap() === HEIGHTS.normal, 'the taskbar reserves its height at the bottom of the screen');

    await set('taskbar-alignment', 'left');
    const [leftX] = center.get_transformed_position();
    require(Math.round(leftX - panel.x) <= 8, 'Start and the apps move to the left edge');
    await captureBottom(`${output}/taskbar-left.png`, monitor);
    await set('taskbar-alignment', 'center');
    const [centerX] = center.get_transformed_position();
    require(Math.abs(centerX + center.width / 2 - (monitor.x + monitor.width / 2)) <= 1, 'Start and the apps return to the middle');

    for (const colorScheme of ['prefer-dark', 'default']) {
      styles.set_string('color-scheme', colorScheme);
      await pause(SCHEME_SETTLE);
      for (const style of ['bar', 'floating']) {
        await set('taskbar-style', style);
        for (const look of ['glass', 'solid', 'transparent', 'accent']) {
          await set('taskbar-look', look);
          const blur = panel.get_effect('backdrop');
          require(panel.has_style_class_name(`kestrel-taskbar-${look}`) && blur.enabled === ['glass', 'accent'].includes(look),
            `the ${style} taskbar takes the ${look} look and blurs only when it needs to`);
          await captureBottom(`${output}/taskbar-${style}-${look}-${colorScheme === 'default' ? 'light' : 'dark'}.png`, monitor);
        }
      }
    }
    styles.set_string('color-scheme', scheme);
    await set('taskbar-look', 'glass');
    await set('taskbar-style', 'floating');

    const floating = panelBox();
    require(floating.x === monitor.x + FLOATING_MARGIN && floating.width === monitor.width - 2 * FLOATING_MARGIN &&
      floating.y + floating.height === monitor.y + monitor.height - FLOATING_MARGIN, 'the floating taskbar keeps a margin from the screen edges');
    require(bottomGap() === HEIGHTS.normal + FLOATING_MARGIN, 'maximized windows stop above the floating taskbar and its margin');
    await set('taskbar-style', 'bar');

    for (const size of ['compact', 'large', 'normal']) {
      await set('taskbar-size', size);
      require(panel.height === HEIGHTS[size] && bottomGap() === HEIGHTS[size], `the ${size} taskbar is ${HEIGHTS[size]} pixels tall and reserves that much`);
      if (size !== 'normal') await captureBottom(`${output}/taskbar-${size}.png`, monitor);
    }

    await set('taskbar-auto-hide', 'always');
    await pause(400);
    require(bottomGap() === 0, 'windows can use the whole screen while the taskbar hides itself');
    require(!panel.visible, 'the taskbar hides itself');
    move(monitor.x + monitor.width / 2, monitor.y + monitor.height - 1);
    await pause(SETTLE);
    require(panel.visible && panel.translation_y === 0, 'pointing at the bottom edge brings the taskbar back');
    move(monitor.x + monitor.width / 2, monitor.y + monitor.height / 2);
    await pause(SETTLE + 400);
    require(!panel.visible, 'the taskbar hides again once the pointer leaves');
    global.display.emit('overlay-key');
    await pause(SETTLE);
    require(panel.visible && panel.translation_y === 0, 'opening Start with Super brings the taskbar back');
    toggleSurface('start');
    await pause(SETTLE + 600);
    require(!panel.visible, 'the taskbar hides once Start closes');

    await set('taskbar-style', 'floating');
    require(bottomGap() === 0, 'a floating taskbar that hides itself leaves the whole screen to windows');
    move(monitor.x + monitor.width / 2, monitor.y + monitor.height - 1);
    await pause(SETTLE);
    const revealed = panelBox();
    require(panel.visible && revealed.y + revealed.height === monitor.y + monitor.height - FLOATING_MARGIN, 'the floating taskbar comes back to its place above the edge');
    move(monitor.x + monitor.width / 2, monitor.y + monitor.height / 2);
    await set('taskbar-style', 'bar');

    await set('taskbar-auto-hide', 'windows');
    const app = Gio.Subprocess.new(['gjs', '-m', GLib.getenv('KESTREL_WINDOW_SCRIPT')], Gio.SubprocessFlags.NONE);
    try {
      await pause(1500);
      const window = global.get_window_actors().map(actor => actor.meta_window).find(candidate => candidate.title === 'Kestrel window check');
      require(panel.visible && bottomGap() === 0, 'the taskbar stays while no window touches it');
      window.maximize();
      await pause(SETTLE + 600);
      const frame = window.get_frame_rect();
      require(frame.y + frame.height === monitor.y + monitor.height, 'a maximized window fills the screen down to the bottom edge');
      require(!panel.visible, 'the taskbar hides while a window touches it');
      window.unmaximize();
      await pause(SETTLE);
      require(panel.visible, 'the taskbar returns once the window moves away');
    } finally {
      app.force_exit();
    }
    await pause(400);
    await set('taskbar-auto-hide', 'never');
    require(panel.visible && bottomGap() === HEIGHTS.normal, 'turning auto-hide off reserves the taskbar again');

    const pinnedCount = settings.get_strv('favorite-apps').length;
    await set('taskbar-show-pinned', false);
    require(slots().length < pinnedCount || pinnedCount === 0, 'the taskbar can show only running apps');
    await set('taskbar-show-pinned', true);

    await checkWorkspaceWindows({require, set, pause, actorNamed, panel, monitor});

    const monitors = Main.layoutManager.monitors;
    if (monitors.length > 1) {
      const other = monitors.find(candidate => candidate.index !== monitor.index);
      const otherGap = () => {
        const area = Main.layoutManager.getWorkAreaForMonitor(other.index);
        return other.y + other.height - area.y - area.height;
      };
      require(!!actorNamed(global.stage, 'kestrel-secondary-panel') && otherGap() === HEIGHTS.normal, 'every display has a taskbar');
      await set('taskbar-displays', 'primary');
      require(!actorNamed(global.stage, 'kestrel-secondary-panel') && otherGap() === 0, 'the taskbar can stay on the main display only');
      await set('taskbar-displays', 'all');
      const secondary = actorNamed(global.stage, 'kestrel-secondary-panel');
      require(!!secondary, 'the other display gets its taskbar back');
      const app = Gio.Subprocess.new(['gjs', '-m', GLib.getenv('KESTREL_WINDOW_SCRIPT')], Gio.SubprocessFlags.NONE);
      try {
        await pause(1500);
        const secondarySlots = () => secondary.get_first_child().get_children()[1].get_children().filter(slot => slot.width > 0);
        const shared = secondarySlots().length;
        await set('taskbar-windows-per-display', true);
        await pause(300);
        require(secondarySlots().length === shared - 1, 'each display can show only its own windows on its taskbar');
      } finally {
        app.force_exit();
      }
      await pause(400);
    }
  } finally {
    for (const key of KEYS) settings.reset(key);
    styles.set_string('color-scheme', scheme);
    await pause(SETTLE);
  }
}

async function checkWorkspaceWindows({require, set, pause, actorNamed, panel, monitor}) {
  const manager = global.workspace_manager;
  const tracker = Shell.WindowTracker.get_default();
  const shownOn = (taskbar, app) => {
    const button = actorNamed(taskbar, `kestrel-app-${app.id}`);
    return button && button.get_parent().width > 0 ? button : null;
  };
  const dots = button => button.child.get_children().filter(actor => actor.has_style_class_name?.('kestrel-running-dot') && actor.visible).length;
  const switchTo = async index => {
    manager.get_workspace_by_index(index).activate(global.get_current_time());
    await pause(SETTLE);
  };
  const multiple = Gio.Subprocess.new(['gjs', '-m', GLib.getenv('KESTREL_WINDOW_SCRIPT'), '--multiple'], Gio.SubprocessFlags.NONE);
  const second = Gio.Subprocess.new(['gjs', '-c', SECOND_APP], Gio.SubprocessFlags.NONE);
  try {
    await pause(1500);
    const windows = global.get_window_actors().map(actor => actor.meta_window);
    const titled = title => windows.find(window => window.title === title);
    const [first, other, lone] = ['Kestrel window check 1', 'Kestrel window check 2', 'Kestrel workspace check'].map(titled);
    for (const window of [first, other, lone]) window.move_to_monitor(monitor.index);
    const app = tracker.get_window_app(first);
    const loneApp = tracker.get_window_app(lone);
    other.change_workspace_by_index(1, false);
    lone.change_workspace_by_index(1, false);
    await pause(SETTLE);
    require(dots(shownOn(panel, app)) === 2 && !!shownOn(panel, loneApp), 'the taskbar lists windows from every workspace by default');

    await set('taskbar-windows-per-workspace', true);
    require(dots(shownOn(panel, app)) === 1 && !shownOn(panel, loneApp), 'the taskbar can list only the windows on the current workspace');
    await switchTo(1);
    require(dots(shownOn(panel, app)) === 1 && !!shownOn(panel, loneApp), 'switching workspaces lists that workspace\'s windows');
    lone.change_workspace_by_index(0, false);
    await pause(SETTLE);
    require(!shownOn(panel, loneApp), 'moving a window to another workspace takes it off the taskbar');
    lone.change_workspace_by_index(1, false);
    await pause(SETTLE);
    require(!!shownOn(panel, loneApp), 'moving a window here puts it on the taskbar');

    const otherMonitor = Main.layoutManager.monitors.find(candidate => candidate.index !== monitor.index);
    if (otherMonitor) {
      await set('taskbar-windows-per-display', true);
      const secondary = actorNamed(global.stage, 'kestrel-secondary-panel');
      lone.move_to_monitor(otherMonitor.index);
      await pause(SETTLE);
      require(!shownOn(panel, loneApp) && !!shownOn(secondary, loneApp) && !shownOn(secondary, app),
        'each display lists only its own windows on the current workspace');
      await switchTo(0);
      require(dots(shownOn(panel, app)) === 1 && !shownOn(secondary, app) && !!shownOn(secondary, loneApp),
        'switching workspaces keeps each display to its own windows, and windows on other displays show on every workspace');
      await set('taskbar-windows-per-display', false);
    }
    await switchTo(0);
    await set('taskbar-windows-per-workspace', false);
    require(dots(shownOn(panel, app)) === 2 && !!shownOn(panel, loneApp), 'turning it off lists every workspace again');
  } finally {
    multiple.force_exit();
    second.force_exit();
    manager.get_workspace_by_index(0).activate(global.get_current_time());
  }
  await pause(500);
}
