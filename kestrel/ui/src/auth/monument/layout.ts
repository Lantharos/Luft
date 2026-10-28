import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Meta from 'gi://Meta';
import Pango from 'gi://Pango';
import St from 'gi://St';

const CLOCK_HEIGHT = 0.3;
const CLOCK_LINE = 0.8;
const CLOCK_INSET = 0.04;
const CLOCK_TRACKING = -0.035;
const AWAKE_SCALE = 0.27;
const DATE_GAP = 22;
const AWAKE_DATE_GAP = 14;
const SIDE_LIFT = 28;
const CONTROLS_MARGIN = 28;
const KEYBOARD_CLEARANCE = 24;
const LARGE_DISPLAY = 1300;
const MARGIN = 56;
const LARGE_MARGIN = 88;
const ASLEEP_DROP = 40;

export interface MonumentParts {
  time: St.Label;
  date: St.Label;
  auth: Clutter.Actor;
  side: Clutter.Actor;
  controls: Clutter.Actor;
}

interface Placement {
  timeLift: number;
  dateLift: number;
  drop: number;
}

function place(actor: Clutter.Actor, x: number, y: number): void {
  const [, , width, height] = actor.get_preferred_size();
  actor.allocate(new Clutter.ActorBox({ x1: Math.round(x), y1: Math.round(y), x2: Math.round(x + width), y2: Math.round(y + height) }));
}

function baselineOf(label: St.Label): number {
  return label.clutter_text.get_layout().get_baseline() / Pango.SCALE;
}

const clockFontSize = (height: number) => Math.round(height * CLOCK_HEIGHT);

export class MonumentLayout extends Clutter.LayoutManager {
  static {
    GObject.registerClass(this);
  }

  private placement: Placement = { timeLift: 0, dateLift: 0, drop: 0 };
  private progress = 0;
  private keyboard = 0;
  private clockSize = 0;

  constructor(private readonly parts: MonumentParts) {
    super();
  }

  set keyboardHeight(height: number) {
    if (this.keyboard === height) return;
    this.keyboard = height;
    this.layout_changed();
  }

  vfunc_get_preferred_width(): [number, number] {
    return [0, 0];
  }

  vfunc_get_preferred_height(): [number, number] {
    return [0, 0];
  }

  vfunc_allocate(_container: Clutter.Actor, box: Clutter.ActorBox): void {
    const [width, height] = box.get_size();
    const { time, date, auth, side, controls } = this.parts;
    const { scaleFactor } = St.ThemeContext.get_for_stage(global.stage);
    const margin = (height / scaleFactor >= LARGE_DISPLAY ? LARGE_MARGIN : MARGIN) * scaleFactor;
    const fontSize = clockFontSize(height / scaleFactor) * scaleFactor;
    this.sizeClock(clockFontSize(height / scaleFactor));
    const [, , timeWidth, timeHeight] = time.get_preferred_size();
    const ascent = baselineOf(time);
    const descent = timeHeight - ascent;
    const boxBottom = height - margin;
    const boxTop = boxBottom - CLOCK_LINE * fontSize;
    const timeY = boxBottom - (CLOCK_LINE / 2 + (descent - ascent) / fontSize / 2) * fontSize - ascent;
    const timeX = margin - CLOCK_INSET * fontSize;
    place(time, timeX, timeY);
    time.set_pivot_point(timeWidth ? CLOCK_INSET * fontSize / timeWidth : 0, timeHeight ? (boxTop - timeY) / timeHeight : 0);

    const [, , , dateHeight] = date.get_preferred_size();
    const dateY = boxTop - DATE_GAP * scaleFactor - dateHeight;
    place(date, margin, dateY);

    this.placement = {
      timeLift: margin - boxTop,
      dateLift: margin + CLOCK_LINE * fontSize * AWAKE_SCALE + AWAKE_DATE_GAP * scaleFactor - dateY,
      drop: ASLEEP_DROP * scaleFactor,
    };

    const [, , , authHeight] = auth.get_preferred_size();
    place(auth, margin, height - Math.max(margin, this.keyboard + KEYBOARD_CLEARANCE * scaleFactor) - authHeight);

    const [, , sideWidth, sideHeight] = side.get_preferred_size();
    place(side, width - margin - sideWidth, height - margin - SIDE_LIFT * scaleFactor - sideHeight);

    const [, , controlsWidth, controlsHeight] = controls.get_preferred_size();
    const controlsMargin = CONTROLS_MARGIN * scaleFactor;
    place(controls, width - controlsMargin - controlsWidth, height - controlsMargin - controlsHeight);

    this.show(this.progress);
  }

  private sizeClock(size: number): void {
    if (size === this.clockSize) return;
    this.clockSize = size;
    global.compositor.get_laters().add(Meta.LaterType.BEFORE_REDRAW, () => {
      this.parts.time.style = `font-size: ${size}px; letter-spacing: ${(CLOCK_TRACKING * size).toFixed(2)}px;`;
      return false;
    });
  }

  show(progress: number): void {
    this.progress = progress;
    const { time, date, auth } = this.parts;
    const scale = 1 + (AWAKE_SCALE - 1) * progress;
    time.set({ scale_x: scale, scale_y: scale, translation_y: this.placement.timeLift * progress });
    date.set({ translation_y: this.placement.dateLift * progress, opacity: Math.round(255 * (1 - 0.15 * progress)) });
    const shown = Math.min(1, Math.max(0, progress));
    auth.set({ opacity: Math.round(255 * Math.min(1, shown * 1.6)), translation_y: this.placement.drop * (1 - progress), visible: shown > 0 });
  }
}
