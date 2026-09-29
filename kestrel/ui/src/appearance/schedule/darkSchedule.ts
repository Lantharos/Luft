import type Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import { getLoginManager } from 'resource:///org/gnome/shell/misc/loginManager.js';

import { Location } from './location.js';
import { dayNumber, dayStart, daylight, type Coordinates } from './sun.js';

interface Transition {
  time: number;
  dark: boolean;
}

const DAY_MS = 86400000;
const SCHEDULE_KEYS = ['dark-schedule', 'dark-schedule-from', 'dark-schedule-to'];

function sunTransitions(coordinates: Coordinates, now: number): Transition[] {
  const today = dayNumber(now);
  return [today - 1, today, today + 1, today + 2].flatMap(day => {
    const light = daylight(coordinates, day);
    if (typeof light === 'string') return [{ time: dayStart(day), dark: light === 'polar-night' }];
    return [{ time: light.sunrise, dark: false }, { time: light.sunset, dark: true }];
  });
}

function customTransitions(from: number, to: number): Transition[] {
  const today = GLib.DateTime.new_now_local();
  return [-1, 0, 1].flatMap(offset => {
    const day = today.add_days(offset)!;
    const at = (hours: number) => {
      const minutes = Math.round(hours * 60);
      return GLib.DateTime.new_local(day.get_year(), day.get_month(), day.get_day_of_month(), Math.floor(minutes / 60) % 24, minutes % 60, 0).to_unix() * 1000;
    };
    return [{ time: at(from), dark: true }, { time: at(to), dark: false }];
  });
}

export class DarkSchedule {
  private readonly location = new Location(() => this.evaluate(true));
  private readonly settingsIds: number[];
  private readonly sleepId: number;
  private timeoutId = 0;
  private evaluatedAt = 0;

  constructor(private readonly settings: Gio.Settings, private readonly interfaceSettings: Gio.Settings) {
    this.settingsIds = SCHEDULE_KEYS.map(key => settings.connect(`changed::${key}`, () => this.start()));
    this.sleepId = getLoginManager().connect('prepare-for-sleep', (_manager, aboutToSuspend) => {
      if (!aboutToSuspend) this.resume();
    });
    this.start();
  }

  private get mode(): string {
    return this.settings.get_string('dark-schedule');
  }

  private start(): void {
    if (this.mode === 'sunset') this.location.refresh();
    this.evaluate(true);
  }

  private resume(): void {
    if (this.mode === 'sunset') this.location.refresh();
    this.evaluate(false);
  }

  private transitions(now: number): Transition[] {
    const coordinates = this.mode === 'sunset' ? this.location.coordinates : null;
    const transitions = coordinates
      ? sunTransitions(coordinates, now)
      : customTransitions(this.settings.get_double('dark-schedule-from'), this.settings.get_double('dark-schedule-to'));
    return transitions.sort((first, second) => first.time - second.time);
  }

  private evaluate(force: boolean): void {
    if (this.timeoutId) GLib.source_remove(this.timeoutId);
    this.timeoutId = 0;
    if (this.mode === 'off') return;
    const now = Date.now();
    const transitions = this.transitions(now);
    const previous = transitions.filter(transition => transition.time <= now).at(-1);
    const next = transitions.find(transition => transition.time > now);
    if (previous && (force || previous.time > this.evaluatedAt)) this.setDark(previous.dark);
    this.evaluatedAt = now;
    this.timeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, Math.min(next ? next.time - now : DAY_MS, DAY_MS), () => {
      this.timeoutId = 0;
      this.evaluate(false);
      return GLib.SOURCE_REMOVE;
    });
  }

  private setDark(dark: boolean): void {
    const scheme = dark ? 'prefer-dark' : 'default';
    if (this.interfaceSettings.get_string('color-scheme') !== scheme) this.interfaceSettings.set_string('color-scheme', scheme);
  }

  destroy(): void {
    if (this.timeoutId) GLib.source_remove(this.timeoutId);
    for (const id of this.settingsIds) this.settings.disconnect(id);
    getLoginManager().disconnect(this.sleepId);
    this.location.destroy();
  }
}
