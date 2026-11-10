import { visibleWallpaperMonitors } from '../../../../desktop/panel/coverage.js';
import { PlaybackConditions } from '../../../../desktop/wallpaper/conditions.js';
import type { ApiContext } from '../core/context.js';
import type { Desktop, Power } from '../types.js';

function changes<State>(context: ApiContext, read: () => State, watch: (changed: () => void) => () => void) {
  return (changed: () => void) => {
    const guarded = context.scope.guard(changed);
    let known = JSON.stringify(read());
    return context.scope.disposable(watch(() => {
      const now = JSON.stringify(read());
      if (now === known) return;
      known = now;
      guarded();
    }));
  };
}

export function desktopApi(context: ApiContext): Desktop {
  const { host } = context;
  const visible = () => host.desktop.wallpaperShown && visibleWallpaperMonitors(host.monitors()).size > 0;
  return {
    get wallpaperVisible() {
      return visible();
    },
    onChanged: changes(context, visible, changed => host.desktop.watch(changed)),
  };
}

class PowerState {
  private conditions: PlaybackConditions | null = null;
  private readonly listeners = new Set<() => void>();

  private get source(): PlaybackConditions {
    return this.conditions ??= new PlaybackConditions(() => this.listeners.forEach(listener => listener()), null);
  }

  get onBattery(): boolean {
    return this.source.onBattery;
  }

  get saving(): boolean {
    return this.source.powerSaving;
  }

  watch(changed: () => void): () => void {
    void this.source;
    this.listeners.add(changed);
    return () => this.listeners.delete(changed);
  }
}

const power = new PowerState();

export function powerApi(context: ApiContext): Power {
  const read = () => ({ onBattery: power.onBattery, saving: power.saving });
  return {
    get onBattery() {
      return power.onBattery;
    },
    get saving() {
      return power.saving;
    },
    onChanged: changes(context, read, changed => power.watch(changed)),
  };
}
