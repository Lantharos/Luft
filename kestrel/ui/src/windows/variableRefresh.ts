import Gio from 'gi://Gio';
import Meta from 'gi://Meta';
import type Shell from 'gi://Shell';

import { isGame } from './games.js';

interface RefreshWindow extends Meta.Window {
  get_content_type(): number;
  set_variable_refresh(allowed: boolean): void;
}

const ContentType = (Meta as unknown as { WindowContentType: Record<'NONE' | 'PHOTO' | 'VIDEO' | 'GAME', number> }).WindowContentType;
const WINDOW_SIGNALS = ['notify::content-type', 'notify::wm-class', 'notify::gtk-application-id'] as const;

export class VariableRefresh {
  private readonly settings = new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });
  private readonly windows = new Map<RefreshWindow, number[]>();
  private readonly settingsSignal: number;
  private readonly createdSignal: number;

  constructor() {
    const shellGlobal = global as unknown as Shell.Global;
    this.settingsSignal = this.settings.connect('changed::variable-refresh', () => {
      for (const window of this.windows.keys()) this.update(window);
    });
    this.createdSignal = shellGlobal.display.connect('window-created', (_display, window: Meta.Window) => this.track(window as RefreshWindow));
    for (const actor of shellGlobal.get_window_actors()) this.track(actor.meta_window as RefreshWindow);
  }

  private track(window: RefreshWindow): void {
    const signals = WINDOW_SIGNALS.map(signal => window.connect(signal, () => this.update(window)));
    signals.push(window.connect('unmanaged', () => this.untrack(window)));
    this.windows.set(window, signals);
    this.update(window);
  }

  private untrack(window: RefreshWindow): void {
    for (const id of this.windows.get(window)!) window.disconnect(id);
    this.windows.delete(window);
  }

  private update(window: RefreshWindow): void {
    window.set_variable_refresh(this.follows(window));
  }

  private follows(window: RefreshWindow): boolean {
    switch (window.get_content_type()) {
      case ContentType.GAME: return true;
      case ContentType.PHOTO:
      case ContentType.VIDEO: return false;
      default: return this.settings.get_string('variable-refresh') === 'fullscreen' || isGame(window);
    }
  }

  destroy(): void {
    for (const window of [...this.windows.keys()]) this.untrack(window);
    this.settings.disconnect(this.settingsSignal);
    (global as unknown as Shell.Global).display.disconnect(this.createdSignal);
  }
}
