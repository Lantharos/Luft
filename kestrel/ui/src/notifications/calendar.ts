import Clutter from 'gi://Clutter';
import Shell from 'gi://Shell';
import St from 'gi://St';

const WEEKS = 6;
const monthTitle = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' });
const weekdayName = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
const weekdayTitle = new Intl.DateTimeFormat(undefined, { weekday: 'long' });
const dateTitle = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'long' });

export class Calendar {
  readonly actor = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-calendar' });
  private readonly weekday = new St.Label({ style_class: 'kestrel-calendar-weekday' });
  private readonly date = new St.Label({ style_class: 'kestrel-calendar-date' });
  private readonly month = new St.Button({ style_class: 'kestrel-calendar-month', can_focus: true, track_hover: true, x_expand: true, x_align: Clutter.ActorAlign.START });
  private readonly days: St.Label[] = [];
  private readonly weekStart = Shell.util_get_week_start();
  private shown = new Date();

  constructor() {
    const today = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-calendar-today' });
    today.add_child(this.weekday);
    today.add_child(this.date);
    this.actor.add_child(today);

    const navigation = new St.BoxLayout({ style_class: 'kestrel-calendar-navigation' });
    this.month.connect('clicked', () => this.showToday());
    navigation.add_child(this.month);
    navigation.add_child(this.pageButton('go-previous-symbolic', 'Previous month', -1));
    navigation.add_child(this.pageButton('go-next-symbolic', 'Next month', 1));
    this.actor.add_child(navigation);

    const grid = new St.Widget({ style_class: 'kestrel-calendar-grid', layout_manager: new Clutter.GridLayout({ column_homogeneous: true, row_spacing: 2 }) });
    const layout = grid.layout_manager as Clutter.GridLayout;
    for (let column = 0; column < 7; column++) {
      const sample = new Date(2023, 0, 1 + (this.weekStart + column) % 7);
      layout.attach(new St.Label({ text: weekdayName.format(sample).slice(0, 2), style_class: 'kestrel-calendar-heading', x_expand: true }), column, 0, 1, 1);
    }
    for (let index = 0; index < WEEKS * 7; index++) {
      const day = new St.Label({ style_class: 'kestrel-calendar-day', x_expand: true, x_align: Clutter.ActorAlign.CENTER });
      this.days.push(day);
      layout.attach(day, index % 7, 1 + Math.floor(index / 7), 1, 1);
    }
    this.actor.add_child(grid);
    this.showToday();
  }

  showToday(): void {
    const now = new Date();
    this.weekday.text = weekdayTitle.format(now);
    this.date.text = dateTitle.format(now);
    this.shown = new Date(now.getFullYear(), now.getMonth(), 1);
    this.render();
  }

  private pageButton(icon: string, label: string, direction: number): St.Button {
    const button = new St.Button({
      style_class: 'kestrel-icon-button kestrel-calendar-page', accessible_name: label, can_focus: true, track_hover: true,
      child: new St.Icon({ icon_name: icon, icon_size: 16 }),
    });
    button.connect('clicked', () => {
      this.shown = new Date(this.shown.getFullYear(), this.shown.getMonth() + direction, 1);
      this.render();
    });
    return button;
  }

  private render(): void {
    this.month.label = monthTitle.format(this.shown);
    const now = new Date();
    const offset = (this.shown.getDay() - this.weekStart + 7) % 7;
    for (const [index, label] of this.days.entries()) {
      const date = new Date(this.shown.getFullYear(), this.shown.getMonth(), 1 + index - offset);
      label.text = `${date.getDate()}`;
      const today = date.toDateString() === now.toDateString();
      label.set_style_pseudo_class(today ? 'selected' : date.getMonth() === this.shown.getMonth() ? null : 'insensitive');
    }
  }
}
