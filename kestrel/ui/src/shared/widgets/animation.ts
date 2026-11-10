import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import St from 'gi://St';

const SPINNER_ANIMATION_TIME = 300;
const SPINNER_ANIMATION_DELAY = 1000;
const SQUARE_LAP = 1000;
const SQUARE_LEAD = 0.25;
const SQUARE_INSET = 3 / 24;
const SQUARE_STROKE = 2.5 / 24;

let kestrelSettings: Gio.Settings | null = null;

function squareCorners(): boolean {
  kestrelSettings ??= new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });
  return !kestrelSettings.get_boolean('rounded-window-corners');
}

/** The spinner's square shape: a segment that travels around a faint square, as in Luft's apps. */
class SquareSpinner extends St.DrawingArea {
  static {
    GObject.registerClass(this);
  }

  private readonly lap = new Clutter.Timeline({ actor: this, duration: SQUARE_LAP, repeat_count: -1 });

  constructor() {
    super({ x_expand: true, y_expand: true });
    this.lap.connect('new-frame', () => this.queue_repaint());
    this.lap.start();
  }

  vfunc_repaint(): void {
    const cr = this.get_context();
    const [size] = this.get_surface_size();
    const inset = size * SQUARE_INSET;
    const side = size - 2 * inset;
    const length = 4 * side;
    const ink = this.get_theme_node().get_foreground_color();
    cr.setLineWidth(size * SQUARE_STROKE);
    cr.rectangle(inset, inset, side, side);
    cr.setSourceRGBA(ink.red / 255, ink.green / 255, ink.blue / 255, 0.2);
    cr.strokePreserve();
    cr.setDash([SQUARE_LEAD * length, (1 - SQUARE_LEAD) * length], -this.lap.get_progress() * length);
    cr.setSourceRGBA(ink.red / 255, ink.green / 255, ink.blue / 255, 1);
    cr.stroke();
    cr.$dispose();
  }
}

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
  private square: SquareSpinner | null = null;

  constructor(size: number, { animate = false, hideOnStop = false }: SpinnerOptions = {}) {
    super({ opacity: 0, layout_manager: new Clutter.BinLayout() });

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
    if (squareCorners()) {
      this.square = new SquareSpinner();
      this.add_child(this.square);
    } else {
      this.set_content(new St.SpinnerContent());
    }
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
    this.square?.destroy();
    this.square = null;
    if (this.hideOnStop) this.hide();
  }

  private get playing(): boolean {
    return this.visible && (this.content !== null || this.square !== null);
  }
}
