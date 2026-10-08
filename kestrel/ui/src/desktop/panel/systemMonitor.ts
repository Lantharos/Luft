import type GioUnix from 'gi://GioUnix';
import Shell from 'gi://Shell';

const BAROMETER = 'com.lantharos.barometer.desktop';

export function systemMonitor(): Shell.App | null {
  const appSystem = Shell.AppSystem.get_default();
  const barometer = appSystem.lookup_app(BAROMETER);
  if (barometer) return barometer;
  const info = appSystem.get_installed().find(app => {
    const categories = (app as GioUnix.DesktopAppInfo).get_categories()?.split(';') ?? [];
    return categories.includes('System') && categories.includes('Monitor');
  });
  return info ? appSystem.lookup_app(info.get_id()!) : null;
}
