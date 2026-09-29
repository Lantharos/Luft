import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

export class ScrollSteps {
  private lastStep = 0;
  private lastScroll = 0;
  private accumulated = 0;

  step(event: Clutter.Event): number {
    const direction = event.get_scroll_direction();
    const now = GLib.get_monotonic_time() / 1000;
    let step: number;
    if (direction === Clutter.ScrollDirection.SMOOTH) {
      if (now - this.lastScroll > 180) this.accumulated = 0;
      this.lastScroll = now;
      const [dx, dy] = event.get_scroll_delta();
      this.accumulated += Math.abs(dy) >= Math.abs(dx) ? dy : dx;
      if (Math.abs(this.accumulated) < 1 || now - this.lastStep < 200) return 0;
      step = Math.sign(this.accumulated);
      this.accumulated = 0;
    } else {
      if (now - this.lastStep < 160) return 0;
      step = [Clutter.ScrollDirection.UP, Clutter.ScrollDirection.LEFT].includes(direction) ? -1 : 1;
    }
    this.lastStep = now;
    return step;
  }
}
