import type Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import * as Main from '../../main.js';
import { BackgroundManager } from '../background.js';
import type { LayoutManager } from '../layout.js';

function waitLoaded(bgManager: BackgroundManager, cancellable: Gio.Cancellable): Promise<void> {
  const { promise, resolve, reject } = Promise.withResolvers<void>();
  const cancelId = cancellable.connect(() => {
    reject(GLib.Error.new_literal(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED, 'Background loading was cancelled'));
  });
  const loadedId = bgManager.connect('loaded', () => {
    bgManager.disconnect(loadedId);
    cancellable.disconnect(cancelId);
    resolve();
  });

  return promise;
}

export class MonitorBackgrounds {
  managers: BackgroundManager[] = [];
  private loadCancellable: Gio.Cancellable | null = null;
  private updateResolvers: PromiseWithResolvers<void> | null = null;

  constructor(private readonly layoutManager: LayoutManager, private readonly container: Clutter.Actor) {}

  async update(startingUp: boolean): Promise<void> {
    if (Main.sessionMode.isGreeter || Main.sessionMode.isPeek || Main.sessionMode.isSetup) return;

    this.loadCancellable?.cancel();
    this.loadCancellable = null;

    for (const manager of this.managers) manager.destroy();
    this.managers = [];

    const cancellable = new Gio.Cancellable();
    this.loadCancellable = cancellable;

    const { monitors, primaryIndex } = this.layoutManager;
    for (let i = 0; i < monitors.length; i++) {
      const manager = this.create(i);
      this.managers.push(manager);

      if (i !== primaryIndex && startingUp) this.holdInPlace(manager.backgroundActor);
    }

    this.updateResolvers ??= Promise.withResolvers<void>();

    const { promise, resolve } = this.updateResolvers;
    try {
      await Promise.all(this.managers.map(manager => waitLoaded(manager, cancellable)));

      this.updateResolvers = null;
      resolve();
    } catch {}

    return promise;
  }

  release(): void {
    for (const manager of this.managers) this.layoutManager.uiGroup.disconnectObject(manager.backgroundActor);
  }

  private holdInPlace(actor: Clutter.Actor): void {
    const group = this.layoutManager.uiGroup;
    const counterScale = () => {
      const { x, y } = group.pivot_point;
      actor.set_pivot_point((x * group.width - actor.x) / actor.width, (y * group.height - actor.y) / actor.height);
      actor.set_scale(1 / group.scale_x, 1 / group.scale_y);
    };
    group.connectObject('notify::scale-x', counterScale, actor);
    counterScale();
  }

  private create(monitorIndex: number): BackgroundManager {
    const manager = new BackgroundManager({
      container: this.container,
      layoutManager: this.layoutManager,
      monitorIndex,
    });

    const makeReactive = () => (manager.backgroundActor.reactive = true);
    manager.connect('changed', makeReactive);
    makeReactive();

    return manager;
  }
}
