import GLib from 'gi://GLib';
import Meta from 'gi://Meta';

import { restartedAfterCrash } from '../../../system/status/health/restarted.js';
import { place, restoreState } from './placement.js';
import { alive, appOf, capture, read, remembered, type SavedWindow, write } from './snapshot.js';

const NOTE_AFTER_MS = 500;
const RETURN_WITHIN_SECONDS = 60;

interface Returned {
  window: Meta.Window;
  stack: number;
}

export class WindowRecovery {
  readonly lost: SavedWindow[] = [];
  private readonly watched = new Map<Meta.Window, number[]>();
  private awaited: SavedWindow[] = [];
  private readonly claimed = new Set<SavedWindow>();
  private returned: Returned[] = [];
  private noteSource = 0;
  private expireSource = 0;
  private writing = false;
  private dirty = false;
  private written = '';

  constructor(private readonly locked: () => boolean, private readonly noted: (windows: SavedWindow[]) => void) {
    if (restartedAfterCrash) this.awaitReturn();
    const display = global.display;
    display.connect('window-created', (_display, window: Meta.Window) => this.created(window));
    display.connect('restacked', () => this.note());
    display.connect('notify::focus-window', () => this.note());
    for (const window of display.list_all_windows()) this.created(window);
  }

  private awaitReturn(): void {
    const saved = read();
    this.awaited = saved.filter(alive);
    const returning = new Set(this.awaited.map(window => window.appId));
    this.lost.push(...saved.filter(window => !returning.has(window.appId)));
    if (!this.awaited.length) return;
    this.expireSource = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, RETURN_WITHIN_SECONDS, () => {
      this.expireSource = 0;
      this.stopAwaiting();
      return GLib.SOURCE_REMOVE;
    });
  }

  private get awaiting(): boolean {
    return this.claimed.size < this.awaited.length;
  }

  private stopAwaiting(): void {
    if (this.expireSource) GLib.source_remove(this.expireSource);
    this.expireSource = 0;
    this.awaited = [];
    this.claimed.clear();
    this.returned = [];
    this.note();
  }

  private created(window: Meta.Window): void {
    if (this.watched.has(window)) return;
    const note = () => this.note();
    const signals = [
      window.connect('unmanaging', () => this.forget(window)),
      window.connect('position-changed', note),
      window.connect('size-changed', note),
      window.connect('workspace-changed', note),
      window.connect('notify::minimized', note),
      window.connect('notify::fullscreen', note),
      window.connect('notify::above', note),
      window.connect('notify::title', note),
    ];
    this.watched.set(window, signals);
    if (!this.awaiting) return;
    if ((window.get_compositor_private() as Meta.WindowActor | null)?.mapped) {
      this.claim(window, null);
      return;
    }
    const configure = window.connect('configure', (_window, config: Meta.WindowConfig) => {
      if (!config.get_is_initial()) return;
      window.disconnect(configure);
      signals.splice(signals.indexOf(configure), 1);
      this.claim(window, config);
    });
    signals.push(configure);
  }

  private claim(window: Meta.Window, config: Meta.WindowConfig | null): void {
    if (!remembered(window)) return;
    const pid = window.get_pid() as number;
    const candidates = this.awaited.filter(saved => !this.claimed.has(saved) && saved.pid === pid && saved.app === appOf(window));
    const saved = candidates.find(candidate => candidate.title === window.get_title()) ?? candidates[0];
    if (!saved) return;
    this.claimed.add(saved);
    const stack = this.awaited.indexOf(saved);
    place(window, saved, config);
    if (config) {
      const shown = window.connect('shown', () => {
        window.disconnect(shown);
        this.returnedTo(window, saved, stack);
      });
    } else {
      this.returnedTo(window, saved, stack);
    }
  }

  private returnedTo(window: Meta.Window, saved: SavedWindow, stack: number): void {
    restoreState(window, saved);
    this.returned = [...this.returned, { window, stack }].sort((a, b) => a.stack - b.stack);
    for (const { window: returned } of this.returned) returned.raise();
    if (saved.focused && !saved.minimized && !this.locked()) window.activate(global.get_current_time());
    if (!this.awaiting) this.stopAwaiting();
  }

  private forget(window: Meta.Window): void {
    for (const signal of this.watched.get(window) ?? []) window.disconnect(signal);
    this.watched.delete(window);
    this.returned = this.returned.filter(returned => returned.window !== window);
    this.note();
  }

  private note(): void {
    if (this.noteSource || this.awaiting) return;
    this.noteSource = GLib.timeout_add(GLib.PRIORITY_LOW, NOTE_AFTER_MS, () => {
      this.noteSource = 0;
      this.save();
      return GLib.SOURCE_REMOVE;
    });
  }

  private save(): void {
    if (this.writing) {
      this.dirty = true;
      return;
    }
    const windows = capture();
    const contents = JSON.stringify(windows);
    if (contents === this.written) return;
    this.written = contents;
    this.writing = true;
    this.noted(windows);
    write(contents, () => {
      this.writing = false;
      if (!this.dirty) return;
      this.dirty = false;
      this.save();
    });
  }
}
