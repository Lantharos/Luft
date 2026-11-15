import type GioUnix from 'gi://GioUnix';
import Shell from 'gi://Shell';

import { launch } from '../../../shared/apps/launch.js';

const BAROMETER = 'com.lantharos.barometer.desktop';
const FOCUS = 'barometer:';

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

export function showInBarometer(app: Shell.App): (() => void) | null {
  const barometer = Shell.AppSystem.get_default().lookup_app(BAROMETER);
  if (!barometer || app === barometer || app.is_window_backed() || app.get_state() !== Shell.AppState.RUNNING) return null;
  return () => launch(barometer.get_app_info()!, [`${FOCUS}${app.id}`]);
}
