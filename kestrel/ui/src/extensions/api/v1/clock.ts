import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import System from 'system';

import { getLoginManager } from '../../../session/actions/loginManager.js';
import type { ClockChange } from './types.js';

const ZONE_FILE = '/etc/localtime';

class ClockChanges {
  private readonly listeners = new Set<(cause: ClockChange) => void>();
  private stop: (() => void) | null = null;

  watch(listener: (cause: ClockChange) => void): () => void {
    this.listeners.add(listener);
    this.stop ??= this.start();
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size) return;
      this.stop?.();
      this.stop = null;
    };
  }

  zoneChanged(): void {
    System.clearDateCaches();
    this.announce('time-zone');
  }

  private announce(cause: ClockChange): void {
    for (const listener of [...this.listeners]) listener(cause);
  }

  private start(): () => void {
    const timeChange = Shell.time_change_source_new();
    timeChange.set_callback(() => {
      this.announce('clock');
      return GLib.SOURCE_CONTINUE;
    });
    timeChange.attach(null);
    const zone = Gio.File.new_for_path(ZONE_FILE).monitor_file(Gio.FileMonitorFlags.NONE, null);
    zone.connect('changed', () => this.zoneChanged());
    const login = getLoginManager();
    const sleep = login.connect('prepare-for-sleep', (_manager, sleeping) => {
      if (!sleeping) this.announce('wake');
    });
    return () => {
      timeChange.destroy();
      zone.cancel();
      login.disconnect(sleep);
    };
  }
}

export const clockChanges = new ClockChanges();
