import Gio from 'gi://Gio';
import type Shell from 'gi://Shell';

import type { Received } from './received.js';

export function receivingApps(files: Received[], from: Shell.App | null): Gio.AppInfo[] {
  const [first, ...rest] = [...new Set(files.map(file => file.contentType))]
    .map(type => Gio.AppInfo.get_recommended_for_type(type).filter(app => app.should_show() && (app.supports_files() || app.supports_uris())));
  const others = rest.map(apps => new Set(apps.map(app => app.get_id())));
  return (first ?? [])
    .filter(app => app.get_id() !== from?.get_id() && others.every(ids => ids.has(app.get_id())))
    .sort((a, b) => a.get_name().localeCompare(b.get_name()));
}
