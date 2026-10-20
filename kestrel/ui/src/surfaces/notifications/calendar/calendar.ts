import Clutter from 'gi://Clutter';
import St from 'gi://St';

import { formatsLocale, t } from '../../../shared/i18n/index.js';
import { animateActor, projection, Spring } from '../../../shared/motion.js';
import { MonthScroll } from './monthScroll.js';
import { weekRow, WeekStrip } from './weekStrip.js';
import { dateOf, dayNumber, firstOfMonth, isoWeek, monthIndex, Weeks } from './weeks.js';
import { WeekStart } from './weekStart.js';

const THROWN_WEEKS_PER_SECOND = 6;

export class Calendar {
  readonly actor = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-calendar', reactive: true });
  private readonly month = new St.Button({ style_class: 'kestrel-calendar-month', can_focus: true, track_hover: true, x_expand: true, x_align: Clutter.ActorAlign.START });
  private readonly headings = weekRow('kestrel-calendar-headings', 'kestrel-calendar-heading');
  private readonly strip = new WeekStrip();
  private readonly weekStart = new WeekStart();
  private readonly weeks = new Weeks();
  private readonly scroll = new MonthScroll(this);
  private shown = monthIndex(new Date());
  private drawn = { week: NaN, month: NaN, today: NaN };
  private readonly monthTitle = new Intl.DateTimeFormat(formatsLocale(), { month: 'long', year: 'numeric' });
  private readonly weekdayName = new Intl.DateTimeFormat(formatsLocale(), { weekday: 'short' });

  constructor() {
    const navigation = new St.BoxLayout({ style_class: 'kestrel-calendar-navigation' });
    this.month.connect('clicked', () => this.show(monthIndex(new Date()), true));
    navigation.add_child(this.month);
    navigation.add_child(this.pageButton('go-previous-symbolic', t('calendar-previous-month'), -1));
    navigation.add_child(this.pageButton('go-next-symbolic', t('calendar-next-month'), 1));
    this.actor.add_child(navigation);
    const grid = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-calendar-grid' });
    grid.add_child(this.headings[0].get_parent()!);
    grid.add_child(this.strip);
    this.actor.add_child(grid);
    this.strip.connect('notify::week', () => this.render());
    this.actor.connect('scroll-event', (_actor, event: Clutter.Event) => this.scroll.handle(event));
    const unwatch = this.weekStart.watch(() => this.align());
    this.actor.connect('destroy', unwatch);
    this.align();
  }

  showToday(): void {
    this.show(monthIndex(new Date()), false);
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
    const now = new Date();
    const today = dayNumber(now);
    const week = Math.floor(this.strip.week);
    const month = this.weeks.nearestMonth(this.strip.week);
    if (week === this.drawn.week && month === this.drawn.month && today === this.drawn.today) return;
    this.drawn = { week, month, today };
    const current = month === monthIndex(now);
    this.month.label = t('calendar-month-week', { month: this.monthTitle.format(firstOfMonth(month)), week: isoWeek(current ? now : firstOfMonth(month)) });
    this.strip.rows.forEach((cells, row) => {
      const first = this.weeks.firstDay(week + row);
      cells.forEach((cell, column) => {
        const date = dateOf(first + column);
        cell.text = `${date.getDate()}`;
        cell.set_style_pseudo_class(first + column === today ? 'selected' : monthIndex(date) === month ? null : 'insensitive');
      });
    });
  }
}
