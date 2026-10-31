import type Gio from 'gi://Gio';
import Shell from 'gi://Shell';

const appSystem = Shell.AppSystem.get_default();

export function appName(app: Gio.AppInfo): string {
  return appSystem.lookup_app(app.get_id() ?? '')?.get_name() ?? app.get_display_name();
}
