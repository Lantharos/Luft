import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';

const ROWS = 7;

function homogeneousRow(styleClass: string): St.Widget {
  return new St.Widget({ style_class: styleClass, x_expand: true, layout_manager: new Clutter.BoxLayout({ homogeneous: true }) });
}

export function weekRow(styleClass: string, cellClass: string): St.Label[] {
  const row = homogeneousRow(styleClass);
  return Array.from({ length: 7 }, () => {
    const cell = new St.Label({ style_class: cellClass, x_expand: true, x_align: Clutter.ActorAlign.CENTER });
    row.add_child(cell);
    return cell;
  });
}

export const WeekStrip = GObject.registerClass({
  Properties: {
    'week': GObject.ParamSpec.double('week', null, null, GObject.ParamFlags.READWRITE, -Number.MAX_VALUE, Number.MAX_VALUE, 0),
  },
}, class WeekStrip extends St.Widget {
  readonly rows: St.Label[][];
  private readonly strip = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-calendar-weeks' });
  private value = 0;
  private pitchValue = 0;

  constructor() {
    super({ style_class: 'kestrel-calendar-viewport', clip_to_allocation: true });
    this.rows = Array.from({ length: ROWS }, () => {
      const cells = weekRow('kestrel-calendar-week', 'kestrel-calendar-day');
      this.strip.add_child(cells[0].get_parent()!);
      return cells;
    });
    this.add_child(this.strip);
  }

  get week(): number {
    return this.value;
  }

  set week(value: number) {
    if (value === this.value) return;
    this.value = value;
    this.place();
    this.notify('week');
  }

  get pitch(): number {
    return this.pitchValue;
  }

  private place(): void {
    this.strip.translation_y = -(this.value - Math.floor(this.value)) * this.pitchValue;
  }

  vfunc_get_preferred_width(forHeight: number): [number, number] {
    return this.strip.get_preferred_width(forHeight);
  }

  vfunc_get_preferred_height(forWidth: number): [number, number] {
    const [, strip] = this.strip.get_preferred_height(forWidth);
    const [, row] = this.strip.get_first_child()!.get_preferred_height(forWidth);
    const visible = strip - (strip - row) / (ROWS - 1);
    return [visible, visible];
  }

  vfunc_allocate(box: Clutter.ActorBox): void {
    this.set_allocation(box);
    const width = box.get_width();
    const [, height] = this.strip.get_preferred_height(width);
    this.strip.allocate(new Clutter.ActorBox({ x1: 0, y1: 0, x2: width, y2: height }));
    const [first, second] = this.strip.get_children();
    this.pitchValue = second.get_allocation_box().y1 - first.get_allocation_box().y1;
    this.place();
  }
});

export type WeekStrip = InstanceType<typeof WeekStrip>;
