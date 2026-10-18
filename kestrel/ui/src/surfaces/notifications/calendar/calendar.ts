import Clutter from 'gi://Clutter';
import St from 'gi://St';

import { WeekStart } from './weekStart.js';

const WEEKS = 6;
const DAY = 86_400_000;
const monthTitle = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' });
const weekdayName = new Intl.DateTimeFormat(undefined, { weekday: 'short' });

function isoWeek(date: Date): number {
  const thursday = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 3 - (date.getDay() + 6) % 7));
  return 1 + Math.floor((thursday.getTime() - Date.UTC(thursday.getUTCFullYear(), 0, 1)) / DAY / 7);
}

export class Calendar {
  readonly actor = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-calendar' });
  private readonly month = new St.Button({ style_class: 'kestrel-calendar-month', can_focus: true, track_hover: true, x_expand: true, x_align: Clutter.ActorAlign.START });
  private readonly headings: St.Label[] = [];
  private readonly days: St.Label[] = [];
  private readonly weekStart = new WeekStart();
  private shown = new Date();

  constructor() {
    const navigation = new St.BoxLayout({ style_class: 'kestrel-calendar-navigation' });
    this.month.connect('clicked', () => this.showToday());
    navigation.add_child(this.month);
    navigation.add_child(this.pageButton('go-previous-symbolic', 'Previous month', -1));
    navigation.add_child(this.pageButton('go-next-symbolic', 'Next month', 1));
    this.actor.add_child(navigation);

    const grid = new St.Widget({ style_class: 'kestrel-calendar-grid', layout_manager: new Clutter.GridLayout({ column_homogeneous: true, row_spacing: 2 }) });
    const layout = grid.layout_manager as Clutter.GridLayout;
    for (let column = 0; column < 7; column++) {
      const heading = new St.Label({ style_class: 'kestrel-calendar-heading', x_expand: true });
      this.headings.push(heading);
      layout.attach(heading, column, 0, 1, 1);
    }
    for (let index = 0; index < WEEKS * 7; index++) {
      const day = new St.Label({ style_class: 'kestrel-calendar-day', x_expand: true, x_align: Clutter.ActorAlign.CENTER });
      this.days.push(day);
      layout.attach(day, index % 7, 1 + Math.floor(index / 7), 1, 1);
    }
    this.actor.add_child(grid);
    const unwatch = this.weekStart.watch(() => this.render());
    this.actor.connect('destroy', unwatch);
    this.showToday();
  }

  showToday(): void {
    const now = new Date();
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
    const now = new Date();
    const current = this.shown.getFullYear() === now.getFullYear() && this.shown.getMonth() === now.getMonth();
    this.month.label = `${monthTitle.format(this.shown)}, week ${isoWeek(current ? now : this.shown)}`;
    const weekStart = this.weekStart.day;
    for (const [column, heading] of this.headings.entries())
      heading.text = weekdayName.format(new Date(2023, 0, 1 + (weekStart + column) % 7)).slice(0, 2);
    const offset = (this.shown.getDay() - weekStart + 7) % 7;
    for (const [index, label] of this.days.entries()) {
      const date = new Date(this.shown.getFullYear(), this.shown.getMonth(), 1 + index - offset);
      label.text = `${date.getDate()}`;
      const today = date.toDateString() === now.toDateString();
      label.set_style_pseudo_class(today ? 'selected' : date.getMonth() === this.shown.getMonth() ? null : 'insensitive');
    }
  }
}
