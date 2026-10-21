import type Gio from 'gi://Gio';
import Shell from 'gi://Shell';

export function watchInstalledApps(changed: (apps: Gio.AppInfo[]) => void): () => void {
  const appSystem = Shell.AppSystem.get_default();
  let catalog = '';
  const load = () => {
    const apps = appSystem.get_installed().filter(app => app.should_show())
      .sort((a, b) => a.get_display_name().localeCompare(b.get_display_name()));
    const loaded = apps.map(app => [app.get_id(), app.get_display_name(), app.get_icon()?.to_string(), app.get_commandline()].join('\n')).join('\n\n');
    if (loaded === catalog) return;
    catalog = loaded;
    changed(apps);
  };
  const signal = appSystem.connect('installed-changed', load);
  load();
  return () => appSystem.disconnect(signal);
}
