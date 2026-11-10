import GLib from 'gi://GLib';

const TRUSTED_FOR_US = 10 * GLib.USEC_PER_SEC;

export class Gestures {
  private last = 0;

  used(): void {
    this.last = GLib.get_monotonic_time();
  }

  get recent(): boolean {
    return !!this.last && GLib.get_monotonic_time() - this.last < TRUSTED_FOR_US;
  }
}
