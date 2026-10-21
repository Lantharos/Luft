import type Meta from 'gi://Meta';

import { TitleBar, type ShowWindowMenu } from './titleBar.js';

export class TitleBars {
  private readonly bars = new Map<Meta.Window, TitleBar>();
  private readonly windows = new Map<Meta.Window, number[]>();
  private readonly createdSignal: number;

  constructor(private readonly showMenu: ShowWindowMenu) {
    this.createdSignal = global.display.connect('window-created', (_display, window: Meta.Window) => this.track(window));
    for (const actor of global.get_window_actors()) this.track(actor.meta_window!);
  }

  private track(window: Meta.Window): void {
    this.windows.set(window, [
      window.connect('notify::titlebar-height', () => this.sync(window)),
      window.connect('unmanaged', () => this.untrack(window)),
    ]);
    this.sync(window);
  }

  private untrack(window: Meta.Window): void {
    for (const id of this.windows.get(window)!) window.disconnect(id);
    this.windows.delete(window);
  }

  private sync(window: Meta.Window): void {
    const bar = this.bars.get(window);
    const actor = window.get_compositor_private() as Meta.WindowActor | null;
    if (window.get_titlebar_height() > 0 && !bar && actor) {
      this.bars.set(window, new TitleBar(window, actor, this.showMenu, () => this.bars.delete(window)));
    } else if (window.get_titlebar_height() === 0 && bar) {
      bar.destroy();
      this.bars.delete(window);
    }
  }

  destroy(): void {
    global.display.disconnect(this.createdSignal);
    for (const window of [...this.windows.keys()]) this.untrack(window);
    for (const bar of this.bars.values()) bar.destroy();
    this.bars.clear();
  }
}
