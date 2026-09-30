import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Shell from 'gi://Shell';
import St from 'gi://St';

export function loadKestrelStylesheet(): Gio.FileMonitor | null {
  const theme = St.ThemeContext.get_for_stage((global as unknown as Shell.Global).stage).get_theme();
  const cssPath = GLib.getenv('KESTREL_CSS_PATH');
  const stylesheet = cssPath
    ? Gio.File.new_for_path(cssPath)
    : Gio.File.new_for_uri('resource:///org/gnome/shell/theme/kestrel.css');
  theme.load_stylesheet(stylesheet);
  if (!cssPath) return null;
  const monitor = stylesheet.monitor_file(Gio.FileMonitorFlags.NONE, null);
  monitor.connect('changed', (_monitor, _file, _otherFile, event) => {
    if (event !== Gio.FileMonitorEvent.CHANGES_DONE_HINT) return;
    theme.unload_stylesheet(stylesheet);
    theme.load_stylesheet(stylesheet);
  });
  return monitor;
}
