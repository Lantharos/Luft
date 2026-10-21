import Gio from 'gi://Gio';
import Meta from 'gi://Meta';

import { isGame } from './games.js';

const WINDOW_SIGNALS = ['notify::content-type', 'notify::wm-class', 'notify::gtk-application-id'] as const;

export class VariableRefresh {
  private readonly settings = new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });
  private readonly windows = new Map<Meta.Window, number[]>();
  private readonly settingsSignal: number;
  private readonly createdSignal: number;

  constructor() {
    this.settingsSignal = this.settings.connect('changed::variable-refresh', () => {
      for (const window of this.windows.keys()) this.update(window);
    });
    this.createdSignal = global.display.connect('window-created', (_display, window: Meta.Window) => this.track(window));
    for (const actor of global.get_window_actors()) this.track(actor.meta_window!);
  }

  private track(window: Meta.Window): void {
    const signals = WINDOW_SIGNALS.map(signal => window.connect(signal, () => this.update(window)));
    signals.push(window.connect('unmanaged', () => this.untrack(window)));
    this.windows.set(window, signals);
    this.update(window);
  }

  private untrack(window: Meta.Window): void {
    for (const id of this.windows.get(window)!) window.disconnect(id);
    this.windows.delete(window);
  }

  private update(window: Meta.Window): void {
    window.set_variable_refresh(this.follows(window));
  }

  private follows(window: Meta.Window): boolean {
    switch (window.get_content_type()) {
      case Meta.WindowContentType.GAME: return true;
      case Meta.WindowContentType.PHOTO:
      case Meta.WindowContentType.VIDEO: return false;
      default: return this.settings.get_string('variable-refresh') === 'fullscreen' || isGame(window);
    }
  }

  destroy(): void {
    for (const window of [...this.windows.keys()]) this.untrack(window);
    this.settings.disconnect(this.settingsSignal);
    global.display.disconnect(this.createdSignal);
  }
}
