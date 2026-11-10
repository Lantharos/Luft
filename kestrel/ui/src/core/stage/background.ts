import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import type GObject from 'gi://GObject';
import Meta from 'gi://Meta';

import { Curve, Duration } from '../../shared/motion/motion.js';
import * as Main from '../main.js';
import { EventEmitter } from '../runtime/signals.js';
import { getBackgroundCache, type BackgroundSource } from './background/cache.js';
import { SystemBackground } from './background/system.js';
import type { Background } from './background/wallpaper.js';
import type { LayoutManager } from './layout.js';

export { Background } from './background/wallpaper.js';
export { SystemBackground };


export type BackgroundActor = Meta.BackgroundActor & {
  content: Meta.BackgroundContent & { background: Background };
};

interface BackgroundManagerOptions {
  container: Clutter.Actor;
  monitorIndex: number;
  layoutManager?: LayoutManager;
  controlPosition?: boolean;
}

interface BackgroundManagerSignals {
  'changed': () => void;
  'loaded': () => void;
}

export class BackgroundManager extends EventEmitter {
  declare connect: GObject.SignalMethods<this, BackgroundManagerSignals>['connect'];
  declare emit: GObject.SignalMethods<this, BackgroundManagerSignals>['emit'];
  declare disconnect: (id: number) => void;

  backgroundActor: BackgroundActor;
  private newBackgroundActor: BackgroundActor | null = null;
  private readonly backgroundSource: BackgroundSource;
  readonly container: Clutter.Actor;
  private readonly layoutManager: LayoutManager;
  private readonly monitorIndex: number;
  private readonly controlPosition: boolean;

  constructor({
    container,
    monitorIndex,
    layoutManager = Main.layoutManager,
    controlPosition = true,
  }: BackgroundManagerOptions) {
    super();
    this.backgroundSource = getBackgroundCache().getBackgroundSource(layoutManager);
    this.container = container;
    this.layoutManager = layoutManager;
    this.monitorIndex = monitorIndex;
    this.controlPosition = controlPosition;

    this.backgroundActor = this.createBackgroundActor();
  }

  destroy(): void {
    getBackgroundCache().releaseBackgroundSource();

    this.newBackgroundActor?.destroy();
    this.newBackgroundActor = null;

    this.backgroundActor.destroy();
  }

  private swapBackgroundActor(newBackgroundActor: BackgroundActor): void {
    const oldBackgroundActor = this.backgroundActor;
    this.backgroundActor = newBackgroundActor;
    this.newBackgroundActor = null;
    this.emit('changed');

    if (Main.layoutManager.screenTransition.visible) {
      oldBackgroundActor.destroy();
      return;
    }

    oldBackgroundActor.ease({
      opacity: 0,
      duration: Duration.linger,
      curve: Curve.gentle,
      onComplete: () => oldBackgroundActor.destroy(),
    });
  }

  private updateBackgroundActor(): void {
    this.newBackgroundActor?.destroy();
    this.newBackgroundActor = null;

    const newBackgroundActor = this.createBackgroundActor();

    const oldContent = this.backgroundActor.content;
    const newContent = newBackgroundActor.content;

    newContent.vignette_sharpness = oldContent.vignette_sharpness;
    newContent.brightness = oldContent.brightness;

    newBackgroundActor.visible = this.backgroundActor.visible;

    this.newBackgroundActor = newBackgroundActor;

    const { background } = newBackgroundActor.content;

    if (background.isLoaded) {
      this.swapBackgroundActor(newBackgroundActor);
      return;
    }

    let loadedId = background.connect('loaded', () => {
      background.disconnect(loadedId);
      loadedId = 0;
      this.swapBackgroundActor(newBackgroundActor);
    });
    newBackgroundActor.connect('destroy', () => {
      if (loadedId) background.disconnect(loadedId);
    });
  }

  private createBackgroundActor(): BackgroundActor {
    const background = this.backgroundSource.getBackground();
    const backgroundActor = new Meta.BackgroundActor({
      meta_display: global.display,
      monitor: this.monitorIndex,
      request_mode: Clutter.RequestMode.CONTENT_SIZE,
    }) as BackgroundActor;
    backgroundActor.content.set({
      background,
      vignette_sharpness: 0.5,
      brightness: 0.5,
    });

    this.container.add_child(backgroundActor);
    this.container.set_child_below_sibling(backgroundActor, null);

    if (this.controlPosition) {
      const monitor = this.layoutManager.monitors[this.monitorIndex];
      backgroundActor.set_position(monitor.x, monitor.y);
    }

    let changeSignalId = background.connect('bg-changed', () => {
      background.disconnect(changeSignalId);
      changeSignalId = 0;
      this.updateBackgroundActor();
    });
    const focusSignalId = background.connect('focus-changed', () => this.emit('changed'));

    let loadedSignalId = 0;
    if (background.isLoaded) {
      GLib.idle_add_once(GLib.PRIORITY_DEFAULT, () => this.emit('loaded'));
    } else {
      loadedSignalId = background.connect('loaded', () => {
        background.disconnect(loadedSignalId);
        loadedSignalId = 0;
        this.emit('loaded');
      });
    }

    backgroundActor.connect('destroy', () => {
      if (changeSignalId) background.disconnect(changeSignalId);
      background.disconnect(focusSignalId);
      if (loadedSignalId) background.disconnect(loadedSignalId);
    });

    return backgroundActor;
  }
}
