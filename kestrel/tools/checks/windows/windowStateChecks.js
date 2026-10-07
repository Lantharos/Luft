import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

const TITLE = 'Kestrel window state: skip above';

function listed(window) {
  const switcher = global.display.get_tab_list(Meta.TabList.NORMAL, null).includes(window);
  const taskbar = Shell.AppSystem.get_default().get_running()
    .some(app => app.get_windows().includes(window));
  return switcher || taskbar;
}

export async function checkWindowState({pause}) {
  const require = (condition, label) => {
    if (!condition) throw new Error(`Kestrel window state check failed: ${label}`);
    console.log(`Kestrel window state check: ${label}`);
  };
  const client = Gio.Subprocess.new(
    ['python3', GLib.getenv('KESTREL_WINDOW_STATE_SCRIPT'), 'skip', 'above'],
    Gio.SubprocessFlags.NONE);
  try {
    await pause(1500);
    const window = global.get_window_actors()
      .map(actor => actor.meta_window)
      .find(candidate => candidate.title === TITLE);

    require(window.skip_taskbar && !listed(window), 'a client can keep its window out of the taskbar and switcher');
    require(window.is_above(), 'a client can keep its window above others');

    client.send_signal(10);
    await pause(300);
    require(!window.skip_taskbar && listed(window), 'the window returns to the taskbar and switcher when the client lets go');
    require(!window.is_above(), 'the window stacks normally again when the client lets go');
  } finally {
    client.force_exit();
  }
  await pause(500);
}
