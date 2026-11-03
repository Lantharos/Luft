import GLib from 'gi://GLib';

const TRUSTED_FOR_US = 10 * GLib.USEC_PER_SEC;

/** When people last used one extension: pressed its shortcut, or clicked something it made. */
export class Gestures {
  private last = 0;

  used(): void {
    this.last = GLib.get_monotonic_time();
  }

  get recent(): boolean {
    return !!this.last && GLib.get_monotonic_time() - this.last < TRUSTED_FOR_US;
  }
}
