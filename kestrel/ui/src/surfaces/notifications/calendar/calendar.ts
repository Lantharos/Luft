import Clutter from 'gi://Clutter';
import St from 'gi://St';

import { formatsLocale, t } from '../../../shared/i18n/index.js';
import { animateActor, projection, Spring } from '../../../shared/motion/motion.js';
import { MonthScroll } from './monthScroll.js';
import { toggleStyleClass } from '../../../shared/widgets/styleClass.js';
import { weekdayHeadings, WeekStrip } from './weekStrip.js';
import { dayNumber, dayOf } from '../../../shared/time/days.js';
import { dateOf, firstOfMonth, isoWeek, monthIndex, Weeks } from './weeks.js';
import { WeekStart } from './weekStart.js';

const THROWN_WEEKS_PER_SECOND = 6;

export class Calendar {
  readonly actor = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-calendar', reactive: true });
  private readonly month = new St.Button({ style_class: 'kestrel-calendar-month', can_focus: true, track_hover: true, x_expand: true, x_align: Clutter.ActorAlign.START });
  private readonly headings = weekdayHeadings();
  private readonly strip = new WeekStrip();
  private readonly weekStart = new WeekStart();
  private readonly weeks = new Weeks();
  private readonly scroll = new MonthScroll(this);
  private shown = monthIndex(new Date());
  private selected: number | null = null;
  private drawn = { week: NaN, month: NaN, today: NaN, selected: NaN };
  private readonly monthTitle = new Intl.DateTimeFormat(formatsLocale(), { month: 'long', year: 'numeric' });
  private readonly weekdayName = new Intl.DateTimeFormat(formatsLocale(), { weekday: 'short' });

  constructor() {
    const navigation = new St.BoxLayout({ style_class: 'kestrel-calendar-navigation' });
    this.month.connect('clicked', () => this.showToday(true));
    navigation.add_child(this.month);
    navigation.add_child(this.pageButton('go-previous-symbolic', t('calendar-previous-month'), -1));
    navigation.add_child(this.pageButton('go-next-symbolic', t('calendar-next-month'), 1));
    this.actor.add_child(navigation);
    const grid = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-calendar-grid' });
    grid.add_child(this.headings[0].get_parent()!);
    grid.add_child(this.strip);
    this.actor.add_child(grid);
    this.strip.rows.forEach((cells, row) => cells.forEach((cell, column) =>
      cell.connect('clicked', () => this.select(this.weeks.firstDay(this.drawn.week + row) + column))));
    this.strip.connect('notify::week', () => this.render());
    this.actor.connect('scroll-event', (_actor, event: Clutter.Event) => this.scroll.handle(event));
    const unwatch = this.weekStart.watch(() => this.align());
    this.actor.connect('destroy', unwatch);
    this.align();
  }

  showToday(animate = false): void {
    this.selected = null;
    this.show(monthIndex(new Date()), animate);
    this.render();
  }

  follow(distance: number): void {
    this.strip.remove_transition('week');
    this.strip.week += distance / this.strip.pitch;
  }

  release(velocity: number): void {
    const speed = velocity / this.strip.pitch;
    this.shown = this.weeks.nearestMonth(this.strip.week + projection(speed));
    const spring = Math.abs(speed) >= THROWN_WEEKS_PER_SECOND ? Spring.thrown : Spring.snappy;
    animateActor(this.strip, { week: this.weeks.startOf(this.shown), spring, velocity: speed });
  }

  step(direction: number): void {
    this.show(this.shown + direction, true);
  }

  private show(month: number, animate: boolean): void {
    this.shown = month;
    const week = this.weeks.startOf(month);
    if (animate) {
      animateActor(this.strip, { week, spring: Spring.snappy });
      return;
    }
    this.strip.remove_transition('week');
    this.strip.week = week;
    this.render();
  }

  private select(day: number): void {
    this.selected = day;
    this.render();
    const month = monthIndex(dateOf(day));
    if (month !== this.shown) this.show(month, true);
  }

  private align(): void {
    const weekStart = this.weekStart.day;
    this.weeks.weekStart = weekStart;
    this.headings.forEach((heading, column) =>
      heading.text = this.weekdayName.format(new Date(2023, 0, 1 + (weekStart + column) % 7)).slice(0, 2));
    this.drawn.week = NaN;
    this.show(this.shown, false);
  }

  private pageButton(icon: string, label: string, direction: number): St.Button {
    const button = new St.Button({
      style_class: 'kestrel-icon-button kestrel-calendar-page', accessible_name: label, can_focus: true, track_hover: true,
      child: new St.Icon({ icon_name: icon, icon_size: 16 }),
    });
    button.connect('clicked', () => this.step(direction));
    return button;
  }

  private render(): void {
    const today = dayNumber(dayOf(new Date()));
    const selected = this.selected ?? today;
    const week = Math.floor(this.strip.week);
    const month = this.weeks.nearestMonth(this.strip.week);
    const drawn = this.drawn;
    if (week === drawn.week && month === drawn.month && today === drawn.today && selected === drawn.selected) return;
    this.drawn = { week, month, today, selected };
    const selectedDate = dateOf(selected);
    const marked = monthIndex(selectedDate) === month ? selectedDate : firstOfMonth(month);
    this.month.label = t('calendar-month-week', { month: this.monthTitle.format(firstOfMonth(month)), week: isoWeek(marked) });
    this.strip.rows.forEach((cells, row) => {
      const first = this.weeks.firstDay(week + row);
      cells.forEach((cell, column) => {
        const day = first + column;
        const date = dateOf(day);
        cell.label = `${date.getDate()}`;
        cell.checked = day === selected;
        toggleStyleClass(cell, 'kestrel-calendar-today', day === today);
        toggleStyleClass(cell, 'kestrel-calendar-outside', monthIndex(date) !== month);
      });
    });
  }
}
