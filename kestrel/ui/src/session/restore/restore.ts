import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import type { ScreenShield } from '../../auth/lockScreen/screenShield.js';
import { place, restoreState } from '../../desktop/windows/recovery/placement.js';
import { appIdOf, remembered } from '../../desktop/windows/recovery/snapshot.js';
import { fitted } from './placement.js';
import type { Plan } from './plan.js';
import type { RecordedWindow } from './record.js';
import type { SessionRecorder } from './recorder.js';

const FIRST_LAUNCH_MS = 300;
const LAUNCH_GAP_MS = 600;
const WAIT_AFTER_LAST_LAUNCH_MS = 30000;
const RESTORE_WINDOWS = 'SABINE_RESTORE_WINDOWS';
const INTERACTIONS = [Clutter.EventType.KEY_PRESS, Clutter.EventType.BUTTON_PRESS, Clutter.EventType.TOUCH_BEGIN];

interface Restored {
  saved: RecordedWindow;
  window: Meta.Window;
}

interface Watched {
  waiting: number;
  unmanaging: number;
}

export class SessionRestore {
  private awaited: RecordedWindow[];
  private readonly launches: Shell.App[];
  private readonly restored: Restored[] = [];
  private readonly watched = new Map<Meta.Window, Watched>();
  private readonly appearing = new Set<Meta.Window>();
  private created = 0;
  private input = 0;
  private interacted = false;
  private source = 0;
  private timestamp = 0;

  constructor(plan: Plan, private readonly recorder: SessionRecorder, private readonly shield: ScreenShield) {
    this.awaited = [...plan.windows];
    this.launches = [...plan.launches];
    if (!shield.locked) {
      this.start();
      return;
    }
    const unlocked = shield.connect('active-changed', () => {
      if (shield.locked) return;
      shield.disconnect(unlocked);
      this.start();
    });
  }

  private start(): void {
    this.timestamp = global.display.get_current_time_roundtrip();
    this.created = global.display.connect('window-created', (_display, window: Meta.Window) => this.watch(window));
    this.input = global.stage.connect('captured-event', (_stage, event: Clutter.Event) => {
      if (INTERACTIONS.includes(event.type())) this.interacted = true;
      return Clutter.EVENT_PROPAGATE;
    });
    for (const window of global.display.list_all_windows()) this.watch(window);
    if (this.awaited.length) this.later(FIRST_LAUNCH_MS, () => this.launchNext());
  }

  private later(ms: number, run: () => void): void {
    this.source = GLib.timeout_add(GLib.PRIORITY_LOW, ms, () => {
      this.source = 0;
      run();
      return GLib.SOURCE_REMOVE;
    });
  }

  private launchNext(): void {
    const app = this.launches.shift();
    if (!app) {
      this.later(WAIT_AFTER_LAST_LAUNCH_MS, () => this.finish());
      return;
    }
    try {
      app.launch_with_environment(this.timestamp, -1, Shell.AppLaunchGpu.APP_PREF, this.restoring(app.get_id()));
    } catch {
      this.awaited = this.awaited.filter(saved => saved.app !== app.get_id());
      this.finishWhenDone();
    }
    if (this.awaited.length) this.later(LAUNCH_GAP_MS, () => this.launchNext());
  }

  private restoring(app: string): string[] | null {
    const tags = this.awaited.filter(saved => saved.app === app && saved.tag).map(saved => saved.tag);
    return tags.length ? [`${RESTORE_WINDOWS}=${tags.join(' ')}`] : null;
  }

  private watch(window: Meta.Window): void {
    if (this.watched.has(window) || !remembered(window)) return;
    const watched = { waiting: 0, unmanaging: window.connect('unmanaging', () => this.forget(window)) };
    this.watched.set(window, watched);
    if ((window.get_compositor_private() as Meta.WindowActor | null)?.mapped) {
      this.claim(window, null);
    } else if (window.get_client_type() === Meta.WindowClientType.X11) {
      watched.waiting = window.connect('shown', () => this.claim(window, null));
    } else {
      watched.waiting = window.connect('configure', (_window, config: Meta.WindowConfig) => {
        if (config.get_is_initial()) this.claim(window, config);
      });
    }
  }

  private stopWaiting(window: Meta.Window): void {
    const watched = this.watched.get(window);
    if (!watched?.waiting) return;
    window.disconnect(watched.waiting);
    watched.waiting = 0;
  }

  private claim(window: Meta.Window, config: Meta.WindowConfig | null): void {
    this.stopWaiting(window);
    const app = appIdOf(window);
    const tag = window.get_tag() ?? '';
    const tagged = this.awaited.findIndex(saved => saved.app === app && saved.tag === tag);
    const index = tagged >= 0 ? tagged : this.awaited.findIndex(saved => saved.app === app);
    if (index < 0) return;
    const saved = fitted(this.awaited.splice(index, 1)[0]);
    place(window, saved, config);
    const restored = { saved, window };
    if (!config) {
      this.appeared(restored);
      return;
    }
    this.appearing.add(window);
    if (window.located_on_workspace(global.workspace_manager.get_active_workspace())) {
      this.watched.get(window)!.waiting = window.connect('shown', () => this.shown(restored));
    } else {
      GLib.idle_add_once(GLib.PRIORITY_LOW, () => this.shown(restored));
    }
  }

  private shown(restored: Restored): void {
    if (!this.appearing.delete(restored.window)) return;
    this.stopWaiting(restored.window);
    this.appeared(restored);
  }

  private appeared(restored: Restored): void {
    const { window, saved } = restored;
    if ((saved.maximized || saved.fullscreen) && window.get_monitor() !== saved.monitor) window.move_to_monitor(saved.monitor);
    restoreState(window, saved);
    this.restored.push(restored);
    this.finishWhenDone();
  }

  private finishWhenDone(): void {
    if (this.awaited.length || this.appearing.size) return;
    if (this.source) GLib.source_remove(this.source);
    this.later(0, () => this.finish());
  }

  private unwatch(window: Meta.Window): void {
    this.stopWaiting(window);
    window.disconnect(this.watched.get(window)!.unmanaging);
    this.watched.delete(window);
  }

  private forget(window: Meta.Window): void {
    this.unwatch(window);
    this.appearing.delete(window);
    const index = this.restored.findIndex(restored => restored.window === window);
    if (index >= 0) this.restored.splice(index, 1);
    this.finishWhenDone();
  }

  private finish(): void {
    if (this.source) GLib.source_remove(this.source);
    this.source = 0;
    this.launches.length = 0;
    this.awaited = [];
    global.display.disconnect(this.created);
    global.stage.disconnect(this.input);
    for (const window of [...this.watched.keys()]) this.unwatch(window);
    this.restack();
    this.recorder.release();
  }

  private restack(): void {
    const restored = this.restored.toSorted((a, b) => a.saved.stack - b.saved.stack);
    for (const { window } of restored) {
      window.raise();
      window.unset_demands_attention();
    }
    const current = global.display.focus_window;
    if (this.interacted && current) {
      current.raise();
      return;
    }
    const focused = restored.find(({ saved }) => saved.focused && !saved.minimized);
    if (focused && !this.shield.locked) focused.window.activate(global.display.get_current_time_roundtrip());
  }
}
