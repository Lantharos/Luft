import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';

export const SPINNER_ANIMATION_TIME = 300;
const SPINNER_ANIMATION_DELAY = 1000;

interface SpinnerOptions {
  animate?: boolean;
  hideOnStop?: boolean;
}

export class Spinner extends St.Widget {
  static {
    GObject.registerClass(this);
  }

  private readonly iconSize: number;
  private readonly animate: boolean;
  private readonly hideOnStop: boolean;

  constructor(size: number, { animate = false, hideOnStop = false }: SpinnerOptions = {}) {
    super({ opacity: 0 });

    this.iconSize = size;
    this.animate = animate;
    this.hideOnStop = hideOnStop;
    this.visible = !hideOnStop;
  }

  vfunc_map(): void {
    const { scaleFactor } = St.ThemeContext.get_for_stage(global.stage);
    const logicalSize = this.iconSize * scaleFactor;
    this.set_size(logicalSize, logicalSize);
    super.vfunc_map();
  }

  play(): void {
    if (this.playing) return;
    this.remove_all_transitions();
    this.set_content(new St.SpinnerContent());
    this.show();

    if (this.animate) {
      this.ease({
        opacity: 255,
        delay: SPINNER_ANIMATION_DELAY,
        duration: SPINNER_ANIMATION_TIME,
        mode: Clutter.AnimationMode.LINEAR,
      });
    } else {
      this.opacity = 255;
    }
  }

  stop(): void {
    if (!this.playing) return;
    this.remove_all_transitions();

    if (this.animate) {
      this.ease({
        opacity: 0,
        duration: SPINNER_ANIMATION_TIME,
        mode: Clutter.AnimationMode.LINEAR,
        onComplete: () => this.clear(),
      });
    } else {
      this.opacity = 0;
      this.clear();
    }
  }

  private clear(): void {
    this.set_content(null);
    if (this.hideOnStop) this.hide();
  }

  private get playing(): boolean {
    return this.visible && this.content !== null;
  }
}
