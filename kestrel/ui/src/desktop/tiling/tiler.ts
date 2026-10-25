import Gio from 'gi://Gio';
import Meta from 'gi://Meta';

import type { Box } from '../../shared/layout/placement.js';
import { boxOf, setEdgesTiled, setUnconstrained } from '../windows/frames.js';
import { TiledSpace } from './layouts/tiledSpace.js';
import { FloatingMemory } from './memory.js';
import { TilingPreferences, type TilingKey, type TilingMode } from './preferences.js';
import { ScrollingSpace } from './scrolling/scrollingSpace.js';
import type { Space, SpaceHost } from './space.js';
import { appKey, floatsByNature, stretched } from './windows.js';

export interface TilingSurroundings {
  monitors(): Box[];
  primaryIndex(): number;
  workArea(monitor: number): Box;
  morph(window: Meta.Window): void;
  boardShown(): boolean;
}

interface Tracked {
  floating: boolean;
  restore: Box | null;
  space: Space | null;
  signals: number[];
}

type Signal = [object: { disconnect(id: number): void }, id: number];

// Windows open when tiling starts, and windows that open while it's on, may be maximized or snapped to a side,
// which Mutter also counts as maximized; unmaximizing them lets them take their tile instead of covering the others
function unstretch(window: Meta.Window): void {
  if (!window.fullscreen && (window.maximized_horizontally || window.maximized_vertically)) window.unmaximize();
}

const RESTORED_WIDTH = 0.6;
const RESTORED_HEIGHT = 0.7;

export class Tiler {
  held: Meta.Window | null = null;
  private readonly preferences: TilingPreferences;
  private readonly memory: FloatingMemory;
  private readonly mutter = new Gio.Settings({ schema_id: 'org.gnome.mutter' });
  private readonly tracked = new Map<Meta.Window, Tracked>();
  private readonly spaces = new Map<Meta.Workspace | null, Map<number, Space>>();
  private readonly opening = new Set<Meta.Window>();
  private readonly unconfigured = new Set<Meta.Window>();
  private readonly floatedByHand = new WeakSet<Meta.Window>();
  private readonly listeners = new Set<(mode: TilingMode) => void>();
  private engaged: TilingMode = 'off';
  private signals: Signal[] = [];
  private boardWasShown = false;
  private readonly host: SpaceHost;

  constructor(private readonly surroundings: TilingSurroundings) {
    this.preferences = new TilingPreferences(key => this.preferenceChanged(key));
    this.host = {
      workArea: monitor => surroundings.workArea(monitor),
      monitorBox: monitor => surroundings.monitors()[monitor]!,
      monitorCount: () => surroundings.monitors().length,
      gap: () => this.preferences.gap,
      besideFocused: () => this.preferences.besideFocused,
      morph: window => surroundings.morph(window),
      ready: window => !this.unconfigured.has(window),
      shown: window => !this.opening.has(window) && !window.minimized &&
        !!(window.get_compositor_private() as Meta.WindowActor | null)?.mapped,
    };
    this.memory = new FloatingMemory(() => this.engage(this.preferences.mode));
  }

  get mode(): TilingMode {
    return this.engaged;
  }

  watchMode(listener: (mode: TilingMode) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  spaceOf(window: Meta.Window | null): Space | null {
    return (window && this.tracked.get(window)?.space) ?? null;
  }

  isTiled(window: Meta.Window | null): boolean {
    return !!this.spaceOf(window);
  }

  visibleSpaces(): Space[] {
    const active = global.workspace_manager.get_active_workspace();
    return [...this.spaces.get(active)?.values() ?? [], ...this.spaces.get(null)?.values() ?? []];
  }

  spaceOn(monitor: number): Space {
    const primary = this.surroundings.primaryIndex();
    const workspace = Meta.prefs_get_workspaces_only_on_primary() && monitor !== primary ? null : global.workspace_manager.get_active_workspace();
    return this.spaceAt(monitor, workspace);
  }

  floatingWindows(): Meta.Window[] {
    return [...this.tracked].filter(([window, record]) => !record.space && this.host.shown(window)).map(([window]) => window);
  }

  arrange(space: Space, animate: boolean): void {
    if (this.surroundings.boardShown() && this.visibleSpaces().includes(space)) return;
    space.arrange(animate, this.held);
  }

  arrangeAll(animate: boolean): void {
    for (const space of this.allSpaces()) this.arrange(space, animate);
  }

  syncBoard(): void {
    const shown = this.surroundings.boardShown();
    if (shown === this.boardWasShown) return;
    this.boardWasShown = shown;
    if (shown) for (const space of this.visibleSpaces()) space.suspend();
    else this.arrangeAll(true);
  }

  moveTo(window: Meta.Window, target: Space, beside: Meta.Window | null): void {
    const record = this.tracked.get(window);
    if (!record?.space || record.space === target) return;
    const source = record.space;
    source.remove(window);
    target.add(window, beside);
    record.space = target;
    this.arrange(source, true);
    this.arrange(target, true);
  }

  toggleFloating(window: Meta.Window): void {
    const record = this.tracked.get(window);
    if (!record || floatsByNature(window)) return;
    const space = record.space;
    record.floating = !!space;
    this.memory.remember(appKey(window), record.floating);
    if (record.floating) this.floatedByHand.add(window);
    else this.floatedByHand.delete(window);
    if (space) {
      space.release(window);
      record.space = null;
      this.float(window, record);
      this.arrange(space, true);
      return;
    }
    if (!stretched(window)) record.restore = boxOf(window.get_frame_rect());
    this.arrange(this.attach(window, null), true);
  }

  monitorsChanged(): void {
    if (this.engaged !== 'off') this.rebuild();
  }

  destroy(): void {
    this.engage('off');
    this.preferences.destroy();
  }

  private engage(mode: TilingMode): void {
    if (this.mutter.get_boolean('edge-tiling') !== (mode === 'off')) this.mutter.set_boolean('edge-tiling', mode === 'off');
    if (mode === this.engaged) return;
    const previous = this.engaged;
    this.engaged = mode;
    if (mode === 'off') this.disengage();
    else if (previous === 'off') this.start();
    else this.rebuild();
    for (const listener of this.listeners) listener(mode);
  }

  private start(): void {
    const display = global.display;
    const manager = global.workspace_manager;
    this.signals = [
      [display, display.connect('window-created', (_display, window: Meta.Window) => this.created(window))],
      [display, display.connect('notify::focus-window', () => this.focusChanged())],
      [display, display.connect('workareas-changed', () => this.arrangeAll(true))],
      [display, display.connect('restacked', () => this.keepFloatingAbove())],
      [manager, manager.connect('workspace-removed', () => this.pruneSpaces())],
    ];
    const windows = display.list_all_windows().sort((a, b) => a.get_stable_sequence() - b.get_stable_sequence());
    for (const window of windows) this.track(window, false);
    this.arrangeAll(true);
  }

  private disengage(): void {
    for (const [object, id] of this.signals) object.disconnect(id);
    this.signals = [];
    for (const [window, record] of this.tracked) {
      for (const id of record.signals) window.disconnect(id);
      if (!record.space) continue;
      record.space.release(window);
      this.float(window, record);
    }
    this.tracked.clear();
    this.opening.clear();
    this.unconfigured.clear();
    for (const space of this.allSpaces()) space.suspend();
    this.spaces.clear();
  }

  private rebuild(): void {
    const order = [...this.allSpaces().flatMap(space => space.windows)];
    for (const space of this.allSpaces()) space.suspend();
    this.spaces.clear();
    for (const record of this.tracked.values()) record.space = null;
    for (const window of [...order, ...this.tracked.keys()]) {
      const record = this.tracked.get(window)!;
      if (!record.space && !record.floating && !window.minimized) this.attach(window, null);
    }
    this.focusChanged();
    this.arrangeAll(true);
  }

  private created(window: Meta.Window): void {
    this.track(window, true, global.display.focus_window);
  }

  private track(window: Meta.Window, opening: boolean, beside: Meta.Window | null = null): void {
    if (this.tracked.has(window) || window.window_type !== Meta.WindowType.NORMAL || window.is_override_redirect()) return;
    const record: Tracked = {
      floating: true,
      restore: opening || stretched(window) ? null : boxOf(window.get_frame_rect()),
      space: null,
      signals: [
        window.connect('unmanaging', () => this.untrack(window)),
        window.connect('notify::minimized', () => this.minimizedChanged(window)),
        window.connect('workspace-changed', () => this.homeChanged(window)),
        window.connect('notify::maximized-horizontally', () => this.stretchChanged(window)),
        window.connect('size-changed', () => this.sizeChanged(window)),
        window.connect('notify::maximized-vertically', () => this.stretchChanged(window)),
        window.connect('notify::fullscreen', () => this.stretchChanged(window)),
        window.connect('notify::transient-for', () => this.natureChanged(window)),
        window.connect('notify::window-type', () => this.natureChanged(window)),
        window.connect('notify::resizeable', () => this.natureChanged(window)),
        window.connect('notify::skip-taskbar', () => this.natureChanged(window)),
      ],
    };
    this.tracked.set(window, record);
    if (opening) this.watchOpening(window, record, beside);
    else this.classify(window, record, null, this.floatedByHand.has(window), true);
  }

  private classify(window: Meta.Window, record: Tracked, beside: Meta.Window | null, floated: boolean, unstretched = false): void {
    record.floating = floatsByNature(window) || floated;
    if (record.floating || window.minimized) return;
    if (unstretched) unstretch(window);
    this.arrange(this.attach(window, beside), true);
  }

  private watchOpening(window: Meta.Window, record: Tracked, beside: Meta.Window | null): void {
    this.opening.add(window);
    this.unconfigured.add(window);
    const configure = window.connect('configure', (_window, config: Meta.WindowConfig) => {
      if (!config.get_is_initial()) return;
      this.forgetSignal(window, record, configure);
      this.classify(window, record, beside, this.memory.floats(appKey(window)));
      this.unconfigured.delete(window);
      const box = record.space?.boxOf(window);
      if (!box) return;
      setUnconstrained(window, true);
      config.set_position(box.x, box.y);
      config.set_size(box.width, box.height);
    });
    const shown = window.connect('shown', () => {
      this.forgetSignal(window, record, shown);
      this.unconfigured.delete(window);
      if (record.signals.includes(configure)) {
        this.forgetSignal(window, record, configure);
        this.classify(window, record, beside, this.memory.floats(appKey(window)), true);
      } else if (record.space) {
        unstretch(window);
        this.arrange(record.space, true);
      }
      if (!record.space) this.centerOnParent(window);
      const actor = window.get_compositor_private() as Meta.WindowActor | null;
      if (!actor) {
        this.opening.delete(window);
        return;
      }
      const settled = actor.connect('effects-completed', () => {
        actor.disconnect(settled);
        this.opening.delete(window);
      });
    });
    record.signals.push(configure, shown);
  }

  private centerOnParent(window: Meta.Window): void {
    const parent = window.get_transient_for();
    const space = this.spaceOf(parent);
    const box = parent && space?.boxOf(parent);
    if (!box || !space) return;
    const area = this.surroundings.workArea(space.monitor);
    const { width, height } = window.get_frame_rect();
    const x = Math.max(area.x, Math.min(box.x + Math.round((box.width - width) / 2), area.x + area.width - width));
    const y = Math.max(area.y, Math.min(box.y + Math.round((box.height - height) / 2), area.y + area.height - height));
    window.move_frame(true, x, y);
  }

  private natureChanged(window: Meta.Window): void {
    const record = this.tracked.get(window)!;
    // Apps such as Chromium and Electron ones can open fixed in size and only then become resizable
    if (!record.space && record.floating && !floatsByNature(window) && !this.floatedByHand.has(window) &&
      !this.memory.floats(appKey(window)) && !this.unconfigured.has(window) && !window.minimized) {
      record.floating = false;
      unstretch(window);
      this.arrange(this.attach(window, null), true);
      return;
    }
    if (!record.space || !floatsByNature(window)) return;
    const space = record.space;
    space.release(window);
    record.space = null;
    record.floating = true;
    this.float(window, record);
    this.arrange(space, true);
  }

  private forgetSignal(window: Meta.Window, record: Tracked, id: number): void {
    window.disconnect(id);
    record.signals = record.signals.filter(other => other !== id);
  }

  private untrack(window: Meta.Window): void {
    const record = this.tracked.get(window);
    if (!record) return;
    for (const id of record.signals) window.disconnect(id);
    this.tracked.delete(window);
    this.opening.delete(window);
    this.unconfigured.delete(window);
    const space = record.space;
    if (!space) return;
    space.remove(window);
    this.arrange(space, true);
  }

  private attach(window: Meta.Window, beside: Meta.Window | null): Space {
    const record = this.tracked.get(window)!;
    const [monitor, workspace] = this.homeOf(window);
    const space = this.spaceAt(monitor, workspace);
    space.add(window, beside);
    record.space = space;
    return space;
  }

  private minimizedChanged(window: Meta.Window): void {
    const record = this.tracked.get(window)!;
    if (window.minimized && record.space) {
      const space = record.space;
      space.release(window);
      record.space = null;
      this.arrange(space, true);
    } else if (!window.minimized && !record.space && !record.floating) {
      this.arrange(this.attach(window, null), true);
    }
  }

  private homeChanged(window: Meta.Window): void {
    const record = this.tracked.get(window)!;
    if (!record.space) return;
    const [monitor, workspace] = this.homeOf(window);
    const home = this.spaceAt(monitor, workspace);
    if (home !== record.space) this.moveTo(window, home, null);
  }

  private sizeChanged(window: Meta.Window): void {
    const space = this.tracked.get(window)?.space;
    if (space instanceof ScrollingSpace && window !== this.held && !stretched(window)) space.widened(window);
  }

  private stretchChanged(window: Meta.Window): void {
    const space = this.tracked.get(window)?.space;
    if (!space) return;
    // Apps that open maximized can ask for it again once shown
    if (this.opening.has(window)) unstretch(window);
    if (!stretched(window)) this.arrange(space, true);
  }

  private focusChanged(): void {
    let window = global.display.focus_window;
    for (let parent = window?.get_transient_for(); parent; parent = parent.get_transient_for()) window = parent;
    const space = this.spaceOf(window);
    if (space && window && !this.surroundings.boardShown()) space.focused(window);
  }

  private keepFloatingAbove(): void {
    const workspace = global.workspace_manager.get_active_workspace();
    const floating = this.floatingWindows().filter(window => window.located_on_workspace(workspace));
    if (!floating.length) return;
    const tiled = [...this.tracked].filter(([window, record]) => record.space && !window.minimized && window.located_on_workspace(workspace)).map(([window]) => window);
    const stacked = global.display.sort_windows_by_stacking([...floating, ...tiled]);
    const topTiled = Math.max(...tiled.map(window => stacked.indexOf(window)));
    for (const window of stacked.filter((window, index) => floating.includes(window) && index < topTiled)) window.raise();
  }

  private float(window: Meta.Window, record: Tracked): void {
    setUnconstrained(window, false);
    setEdgesTiled(window, false);
    if (stretched(window)) return;
    const box = record.restore ?? this.restoredBox(window);
    this.surroundings.morph(window);
    window.move_resize_frame(true, box.x, box.y, box.width, box.height);
  }

  private restoredBox(window: Meta.Window): Box {
    const [monitor] = this.homeOf(window);
    const area = this.surroundings.workArea(monitor);
    const frame = window.get_frame_rect();
    const width = window.allows_resize() ? Math.round(area.width * RESTORED_WIDTH) : frame.width;
    const height = window.allows_resize() ? Math.round(area.height * RESTORED_HEIGHT) : frame.height;
    return { x: area.x + Math.round((area.width - width) / 2), y: area.y + Math.round((area.height - height) / 2), width, height };
  }

  private homeOf(window: Meta.Window): [monitor: number, workspace: Meta.Workspace | null] {
    const primary = this.surroundings.primaryIndex();
    const monitor = this.tracked.get(window)?.space?.monitor ?? (window.get_monitor() >= 0 ? window.get_monitor() : primary);
    const onlyPrimary = Meta.prefs_get_workspaces_only_on_primary();
    return [monitor, onlyPrimary && monitor !== primary ? null : window.get_workspace() ?? global.workspace_manager.get_active_workspace()];
  }

  private spaceAt(monitor: number, workspace: Meta.Workspace | null): Space {
    let byMonitor = this.spaces.get(workspace);
    if (!byMonitor) this.spaces.set(workspace, byMonitor = new Map());
    let space = byMonitor.get(monitor);
    if (!space) {
      space = this.engaged === 'scrolling' ? new ScrollingSpace(monitor, this.host) : new TiledSpace(monitor, this.preferences.layout, this.host);
      byMonitor.set(monitor, space);
    }
    return space;
  }

  private allSpaces(): Space[] {
    return [...this.spaces.values()].flatMap(byMonitor => [...byMonitor.values()]);
  }

  private pruneSpaces(): void {
    const manager = global.workspace_manager;
    const alive = new Set(Array.from({ length: manager.n_workspaces }, (_, index) => manager.get_workspace_by_index(index)));
    for (const [workspace, byMonitor] of this.spaces) {
      if (workspace && !alive.has(workspace) && [...byMonitor.values()].every(space => !space.windows.length)) {
        for (const space of byMonitor.values()) space.suspend();
        this.spaces.delete(workspace);
      }
    }
  }

  private preferenceChanged(key: TilingKey): void {
    if (key === 'window-tiling') this.engage(this.preferences.mode);
    else if (key === 'tiling-layout' && this.engaged === 'tiling') this.rebuild();
    else if (key === 'tiling-gaps' && this.engaged !== 'off') this.arrangeAll(true);
  }
}
