import Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';

import { appKey } from '../../shared/launchHistory.js';
import type { Searchable } from './ranking.js';

export interface AppEntry extends Searchable {
  app: Gio.AppInfo;
}

export function indexApps(apps: Gio.AppInfo[]): AppEntry[] {
  return apps.map(app => ({
    app,
    key: appKey(app.get_id()!),
    name: app.get_display_name().toLocaleLowerCase(),
    keywords: (app instanceof GioUnix.DesktopAppInfo ? app.get_keywords() ?? [] : []).map(keyword => keyword.toLocaleLowerCase()),
  }));
}
