import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import { option, type Options } from '../core/request.js';

export const MONITOR = 1;
export const WINDOW = 2;
export const VIRTUAL = 4;
const CURSOR_MODES = [1, 2, 4];

export interface MonitorSource {
  readonly type: typeof MONITOR;
  readonly connector: string;
  readonly match: string;
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly primary: boolean;
  readonly builtin: boolean;
}

export interface WindowSource {
  readonly type: typeof WINDOW;
  readonly window: Meta.Window;
  readonly app: Shell.App | null;
}

export interface VirtualSource {
  readonly type: typeof VIRTUAL;
}

export type Source = MonitorSource | WindowSource | VirtualSource;
export type StoredSource = [id: number, type: number, data: GLib.Variant];

export interface Selection {
  readonly types: number;
  readonly multiple: boolean;
  readonly cursorMode: number;
}

const shell = () => global as unknown as Shell.Global;

export function selectionFrom(options: Options): Selection | null {
  const types = option<number>(options, 'types') ?? MONITOR;
  const cursorMode = option<number>(options, 'cursor_mode') ?? 1;
  if (!(types & (MONITOR | WINDOW | VIRTUAL)) || !CURSOR_MODES.includes(cursorMode)) return null;
  return { types, multiple: option<boolean>(options, 'multiple') ?? false, cursorMode };
}

function matchString(monitor: Meta.Monitor): string {
  const identity = [monitor.get_vendor(), monitor.get_product(), monitor.get_serial()];
  return identity.every(part => !part || part === 'unknown') ? monitor.get_connector() : identity.join(':');
}

export function monitorSources(): MonitorSource[] {
  const { display, backend } = shell();
  const primary = display.get_primary_monitor();
  return (backend.get_monitor_manager().get_logical_monitors() ?? []).flatMap(logical => {
    const { width, height } = display.get_monitor_geometry(logical.get_number());
    return logical.get_monitors().map(monitor => ({
      type: MONITOR, connector: monitor.get_connector(), match: matchString(monitor), name: monitor.is_virtual() ? 'Virtual screen' : monitor.get_display_name(),
      width, height, primary: logical.get_number() === primary, builtin: monitor.is_builtin(),
    }));
  });
}

export function windowSources(): WindowSource[] {
  const tracker = Shell.WindowTracker.get_default();
  return shell().display.get_tab_list(Meta.TabList.NORMAL, null)
    .map(window => ({ type: WINDOW, window, app: tracker.get_window_app(window) }));
}

function windowAppId({ window, app }: WindowSource): string {
  return app?.get_id() ?? window.get_sandboxed_app_id() ?? window.get_wm_class() ?? '';
}

function storedData(source: Source): GLib.Variant {
  switch (source.type) {
    case MONITOR: return new GLib.Variant('s', source.match);
    case WINDOW: return new GLib.Variant('(ss)', [windowAppId(source), source.window.get_title() ?? '']);
    case VIRTUAL: return new GLib.Variant('b', true);
  }
}

export function storedSources(sources: Source[]): StoredSource[] {
  return sources.map((source, index) => [index, source.type, storedData(source)]);
}

function distance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++)
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    previous = current;
  }
  return previous[b.length];
}

function closestWindow(appId: string, title: string): WindowSource | null {
  const candidates = windowSources().filter(source => windowAppId(source) === appId)
    .map(source => ({ source, distance: distance(source.window.get_title() ?? '', title) }))
    .sort((a, b) => a.distance - b.distance);
  const best = candidates[0];
  return best && best.distance <= title.length / 2 ? best.source : null;
}

function restoredSource([, type, data]: StoredSource, types: number): Source | null {
  if (!(type & types)) return null;
  const signature = data.get_type_string();
  if (type === MONITOR && signature === 's') return monitorSources().find(monitor => monitor.match === data.get_string()[0]) ?? null;
  if (type === WINDOW && signature === '(ss)') return closestWindow(...data.deep_unpack() as [string, string]);
  if (type === VIRTUAL && signature === 'b') return { type: VIRTUAL };
  return null;
}

export function restoredSources(stored: StoredSource[], types: number): Source[] | null {
  const sources = stored.map(entry => restoredSource(entry, types));
  return sources.length && sources.every(source => source) ? sources as Source[] : null;
}
