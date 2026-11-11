import Gio from 'gi://Gio';
import Shell from 'gi://Shell';

import { autostarts } from './autostart.js';
import type { RecordedWindow, SessionRecord } from './record.js';

const REOPEN_APPS = 'reopen-apps';

export interface Plan {
  windows: RecordedWindow[];
  launches: Shell.App[];
}

export function reopened(record: SessionRecord | null): RecordedWindow[] {
  if (!record) return [];
  if (record.ending === 'ordinary' && !new Gio.Settings({ schema_id: 'com.lantharos.kestrel' }).get_boolean(REOPEN_APPS)) return [];
  return record.windows;
}

function launchOrder(windows: RecordedWindow[]): string[] {
  const focusedFirst = [...windows.filter(window => window.focused), ...windows.toSorted((a, b) => b.stack - a.stack)];
  return [...new Set(focusedFirst.map(window => window.app))];
}

export function planFor(windows: RecordedWindow[], afterCrash: boolean): Plan {
  const appSystem = Shell.AppSystem.get_default();
  const apps = new Map(launchOrder(windows).map(id => [id, appSystem.lookup_app(id)] as const));
  const stopped = (app: Shell.App) => app.get_state() === Shell.AppState.STOPPED;
  const restorable = new Set([...apps].filter(([, app]) => app && (!afterCrash || stopped(app))).map(([id]) => id));
  return {
    windows: windows.filter(window => restorable.has(window.app)),
    launches: [...restorable].map(id => apps.get(id)!).filter(app => stopped(app) && !autostarts(app.get_id())),
  };
}
