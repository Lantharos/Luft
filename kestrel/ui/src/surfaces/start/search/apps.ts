import Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';

import { appKey } from '../../../shared/launchHistory.js';
import type { Searchable } from './ranking.js';

export interface AppEntry extends Searchable {
  app: Gio.AppInfo;
}

function searchTerms(app: Gio.AppInfo): string[] {
  if (!(app instanceof GioUnix.DesktopAppInfo)) return [];
  const keywords = app.get_keywords() ?? [];
  const genericName = app.get_generic_name();
  return genericName ? [genericName, ...keywords] : keywords;
}

export function indexApps(apps: Gio.AppInfo[]): AppEntry[] {
  return apps.map(app => ({
    app,
    key: appKey(app.get_id()!),
    name: app.get_display_name().toLocaleLowerCase(),
    keywords: searchTerms(app).map(term => term.toLocaleLowerCase()),
  }));
}
