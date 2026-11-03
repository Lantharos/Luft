import GLib from 'gi://GLib';

import { restartedAfterCrash } from '../../system/health/restarted.js';

const CRASHES_BEFORE_OFF = 2;

interface Record {
  running: string[];
  crashes: { [id: string]: number };
}

const decoder = new TextDecoder();

/**
 * Remembers which extensions run, so that when Kestrel starts again after crashing, the extensions that were running
 * through two crashes in a row are named and kept off.
 */
export class CrashGuard {
  private readonly file = GLib.build_filenamev([GLib.get_user_state_dir(), 'kestrel', 'extensions-running.json']);
  private readonly record: Record;

  constructor() {
    this.record = restartedAfterCrash ? this.afterCrash() : { running: [], crashes: {} };
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

  /** Extensions that were running through the crashes Kestrel just came back from. */
  get culprits(): string[] {
    return Object.entries(this.record.crashes).filter(([, crashes]) => crashes >= CRASHES_BEFORE_OFF).map(([id]) => id);
  }

  running(ids: string[]): void {
    this.record.running = [...ids].sort();
    GLib.mkdir_with_parents(GLib.path_get_dirname(this.file), 0o700);
    GLib.file_set_contents(this.file, JSON.stringify(this.record));
  }
}
