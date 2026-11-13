import GLib from 'gi://GLib';

import { restartedAfterCrash } from '../../../system/status/health/restarted.js';
import { afterCrash, type Record } from './count.js';

const CRASHES_BEFORE_OFF = 2;

const decoder = new TextDecoder();

export class CrashGuard {
  private readonly file = GLib.build_filenamev([GLib.get_user_state_dir(), 'kestrel', 'extensions-running.json']);
  private readonly record: Record;
  readonly culprits: string[];

  constructor() {
    const now = GLib.get_monotonic_time();
    this.record = restartedAfterCrash ? this.afterCrash(now) : { started: now, running: [], crashes: {}, turnedOff: [] };
    this.culprits = Object.entries(this.record.crashes).filter(([, crashes]) => crashes >= CRASHES_BEFORE_OFF).map(([id]) => id);
    for (const id of this.culprits) delete this.record.crashes[id];
    this.record.turnedOff = [...new Set([...this.record.turnedOff, ...this.culprits])];
  }

  get turnedOffLately(): readonly string[] {
    return this.record.turnedOff;
  }

  private afterCrash(now: number): Record {
    try {
      const [, contents] = GLib.file_get_contents(this.file);
      return afterCrash(JSON.parse(decoder.decode(contents)) as Record, now);
    } catch {
      return { started: now, running: [], crashes: {}, turnedOff: [] };
    }
  }

  running(ids: string[]): void {
    this.record.running = [...ids].sort();
    GLib.mkdir_with_parents(GLib.path_get_dirname(this.file), 0o700);
    GLib.file_set_contents(this.file, JSON.stringify(this.record));
  }
}
