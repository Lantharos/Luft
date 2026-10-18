import type Meta from 'gi://Meta';
import type Shell from 'gi://Shell';

import { TitleBar, type DecoratedWindow, type ShowWindowMenu } from './titleBar.js';

const shell = () => global as unknown as Shell.Global;

export class TitleBars {
  private readonly bars = new Map<DecoratedWindow, TitleBar>();
  private readonly windows = new Map<DecoratedWindow, number[]>();
  private readonly createdSignal: number;

  constructor(private readonly showMenu: ShowWindowMenu) {
    this.createdSignal = shell().display.connect('window-created', (_display, window: Meta.Window) => this.track(window as DecoratedWindow));
    for (const actor of shell().get_window_actors()) this.track(actor.meta_window as DecoratedWindow);
  }

  private track(window: DecoratedWindow): void {
    this.windows.set(window, [
      window.connect('notify::titlebar-height', () => this.sync(window)),
      window.connect('unmanaged', () => this.untrack(window)),
    ]);
    this.sync(window);
  }

  private untrack(window: DecoratedWindow): void {
    for (const id of this.windows.get(window)!) window.disconnect(id);
    this.windows.delete(window);
  }

  private sync(window: DecoratedWindow): void {
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
    shell().display.disconnect(this.createdSignal);
    for (const window of [...this.windows.keys()]) this.untrack(window);
    for (const bar of this.bars.values()) bar.destroy();
    this.bars.clear();
  }
}
