import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import {showSurfaceForCapture} from 'resource:///org/gnome/shell/ui/kestrelUi.js';

export const METRICS = {};

function pause(milliseconds) {
  return new Promise(resolve => {
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, milliseconds, () => {
      resolve();
      return GLib.SOURCE_REMOVE;
    });
  });
}

async function capture(path) {
  const stream = Gio.File.new_for_path(path).replace(
    null,
    false,
    Gio.FileCreateFlags.NONE,
    null,
  );
  const screenshot = new Shell.Screenshot();
  await new Promise((resolve, reject) => {
    screenshot.screenshot(false, stream, (source, result) => {
      try {
        source.screenshot_finish(result);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
  stream.close(null);
}

export async function run() {
  const output = GLib.getenv('KESTREL_CAPTURE_DIR');
  if (!output)
    throw new Error('KESTREL_CAPTURE_DIR is required');

  await pause(700);
  await capture(`${output}/panel.png`);

  global.display.emit('overlay-key');
  await pause(350);
  await capture(`${output}/start.png`);

  showSurfaceForCapture('quick');
  await pause(350);
  await capture(`${output}/quick-settings.png`);

  showSurfaceForCapture('notifications');
  await pause(350);

  showSurfaceForCapture('power');
  await pause(350);
  await capture(`${output}/power-menu.png`);

  const windowScript = GLib.getenv('KESTREL_WINDOW_SCRIPT');
  if (windowScript) {
    showSurfaceForCapture('power');
    const app = Gio.Subprocess.new(['gjs', '-m', windowScript], Gio.SubprocessFlags.NONE);
    try {
      await pause(1100);
      await capture(`${output}/window.png`);
    } finally {
      app.force_exit();
    }
  }
}
