import GLib from 'gi://GLib';

import { restartedAfterCrash } from '../../system/status/health/restarted.js';

const CRASHES_BEFORE_OFF = 2;

interface Record {
  running: string[];
  crashes: { [id: string]: number };
}

const decoder = new TextDecoder();

export class CrashGuard {
  private readonly file = GLib.build_filenamev([GLib.get_user_state_dir(), 'kestrel', 'extensions-running.json']);
  private readonly record: Record;
  readonly culprits: string[];

  constructor() {
    this.record = restartedAfterCrash ? this.afterCrash() : { running: [], crashes: {} };
    this.culprits = Object.entries(this.record.crashes).filter(([, crashes]) => crashes >= CRASHES_BEFORE_OFF).map(([id]) => id);
    for (const id of this.culprits) delete this.record.crashes[id];
  }

  private afterCrash(): Record {
    try {
      const [, contents] = GLib.file_get_contents(this.file);
      const previous = JSON.parse(decoder.decode(contents)) as Record;
      return { running: [], crashes: Object.fromEntries(previous.running.map(id => [id, (previous.crashes[id] ?? 0) + 1])) };
    } catch {
      return { running: [], crashes: {} };
    }
  }

  running(ids: string[]): void {
    this.record.running = [...ids].sort();
    GLib.mkdir_with_parents(GLib.path_get_dirname(this.file), 0o700);
    GLib.file_set_contents(this.file, JSON.stringify(this.record));
  }
}
