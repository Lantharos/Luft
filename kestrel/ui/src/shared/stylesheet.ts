import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Shell from 'gi://Shell';
import St from 'gi://St';

const STYLESHEETS = ['kestrel.css', 'kestrel-portal.css'];

function watch(theme: St.Theme, stylesheet: Gio.File): Gio.FileMonitor {
  const monitor = stylesheet.monitor_file(Gio.FileMonitorFlags.NONE, null);
  monitor.connect('changed', (_monitor, _file, _otherFile, event) => {
    if (event !== Gio.FileMonitorEvent.CHANGES_DONE_HINT) return;
    theme.unload_stylesheet(stylesheet);
    theme.load_stylesheet(stylesheet);
  });
  return monitor;
}

export function loadKestrelStylesheets(): Gio.FileMonitor[] {
  const theme = St.ThemeContext.get_for_stage((global as unknown as Shell.Global).stage).get_theme();
  const cssPath = GLib.getenv('KESTREL_CSS_PATH');
  const directory = cssPath ? Gio.File.new_for_path(cssPath).get_parent()! : Gio.File.new_for_uri('resource:///org/gnome/shell/theme');
  const stylesheets = STYLESHEETS.map(name => directory.get_child(name));
  for (const stylesheet of stylesheets) theme.load_stylesheet(stylesheet);
  return cssPath ? stylesheets.map(stylesheet => watch(theme, stylesheet)) : [];
}
