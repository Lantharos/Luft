import type { Disposable, Extension } from '@luft/extension-api';

import { readCalendar, type Reading } from './calendar/read.js';
import { writeCalendar } from './calendar/write.js';
import { nextMidnight } from './model/days.js';
import { completed, momentsOf, type MomentKind, rang, rolled, type Rules, warnAt } from './model/moments.js';
import type { Draft, Reminder } from './model/types.js';

export type Granted = 'taskbar' | 'popups' | 'notifications' | 'search' | 'shortcuts';

const FILE = 'reminders.json';
const FORMAT = 1;
const LONGEST_TIMER_MS = 2 ** 31 - 1;
const KEPT_DONE_MS = 30 * 24 * 3_600_000;

interface Saved {
  version: number;
  reminders: Reminder[];
}

/** Something that came due and should reach people now. */
export interface Due {
  reminder: Reminder;
  kind: Exclude<MomentKind, 'roll'>;
}

/** What reaches people. */
export interface Bell {
  ring(due: readonly Due[], now: number, rules: Rules): void;
  /** People dealt with this reminder, so whatever it showed can go. */
  answered(id: string): void;
}

const newId = (now: number) => `${now.toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

/**
 * Every reminder and the one timer that serves them all. The timer is always set for the next thing that can happen,
 * however many reminders there are, and is set again when something changes or the time jumps, so nothing here runs
 * in between. The file is written after each change, in one go, and is the only copy that matters.
 */
export class Reminders {
  private list: Reminder[];
  private bell: Bell | null = null;
  private timer: Disposable | null = null;
  private writing = false;
  private writeAgain = false;
  private readonly listeners = new Set<() => void>();

  constructor(private readonly extension: Extension<Granted>) {
    const saved = extension.readText(`${extension.dataPath}/${FILE}`);
    const oldest = Date.now() - KEPT_DONE_MS;
    this.list = saved ? (JSON.parse(saved) as Saved).reminders.filter(({ doneAt }) => doneAt === null || doneAt > oldest) : [];
    if (!saved) this.save();
  }

  /** Starts ringing and watching the clock. */
  start(bell: Bell): void {
    this.bell = bell;
    const { extension } = this;
    extension.timers.onClockChanged(() => this.refresh());
    extension.notifications.onHeldBackChanged(() => this.refresh());
    extension.session.onChanged(() => this.refresh());
    extension.settings.onChanged(() => this.refresh());
    this.refresh();
  }

  get all(): readonly Reminder[] {
    return this.list;
  }

  get rules(): Rules {
    const { settings } = this.extension;
    return {
      morning: settings.get<string>('morning'),
      nagMinutes: settings.get<boolean>('come-back') ? Number(settings.get<string>('come-back-every')) : null,
      nudgeDays: settings.get<boolean>('goal-nudges') ? Number(settings.get<string>('goal-nudge-every')) : null,
    };
  }

  find(id: string): Reminder | undefined {
    return this.list.find(reminder => reminder.id === id);
  }

  onChanged(listener: () => void): void {
    this.listeners.add(listener);
  }

  add(draft: Draft): Reminder {
    const now = Date.now();
    const reminder = { ...draft, id: newId(now), rung: null, snoozedUntil: null, warned: this.warnedAlready(draft, now), doneAt: null, createdAt: now, updatedAt: now };
    this.list = [...this.list, reminder];
    this.changed();
    return reminder;
  }

  edit(id: string, draft: Draft): void {
    const now = Date.now();
    this.bell?.answered(id);
    this.replace(id, reminder => {
      const moved = JSON.stringify(reminder.when) !== JSON.stringify(draft.when);
      return { ...reminder, ...draft, updatedAt: now, ...moved ? { rung: null, snoozedUntil: null, warned: this.warnedAlready(draft, now) } : {} };
    });
  }

  complete(id: string): void {
    this.bell?.answered(id);
    this.replace(id, reminder => completed(reminder, Date.now(), this.rules));
  }

  snooze(id: string, until: number): void {
    this.bell?.answered(id);
    this.replace(id, reminder => ({ ...reminder, snoozedUntil: until, updatedAt: Date.now() }));
  }

  remove(id: string): void {
    this.bell?.answered(id);
    this.list = this.list.filter(reminder => reminder.id !== id);
    this.changed();
  }

  /** Puts back a reminder as it was, for Undo. */
  restore(reminder: Reminder): void {
    this.list = [...this.list.filter(other => other.id !== reminder.id), reminder];
    this.changed();
  }

  exported(): string {
    return writeCalendar(this.list, Date.now());
  }

  /** Adds what a calendar file holds; a reminder imported before is updated, so importing again doesn't double anything. */
  async import(text: string): Promise<Reading> {
    const now = Date.now();
    const reading = await readCalendar(text, now, () => new Promise(resolve => this.extension.timers.timeout(0, () => resolve())));
    const known = new Map(this.list.map(reminder => [reminder.id, reminder]));
    for (const { uid, ...found } of reading.found) {
      const id = uid ?? newId(now + known.size);
      const draft = { ...found, persistent: true, nudgeDays: null };
      const existing = known.get(id);
      known.set(id, existing
        ? { ...existing, ...draft, updatedAt: now }
        : { ...draft, id, rung: null, snoozedUntil: null, warned: this.warnedAlready(draft, now), doneAt: null, createdAt: now, updatedAt: now });
    }
    this.list = [...known.values()];
    this.changed();
    return reading;
  }

  /** Brings everything up to now: moves repeats on, rings what's due and sets the timer for what's next. */
  refresh(): void {
    const now = Date.now();
    const rules = this.rules;
    const moved = this.list.map(reminder => rolled(reminder, now, rules));
    const shifted = moved.some((reminder, index) => reminder !== this.list[index]);
    this.list = moved;
    const due = this.dueNow(now, rules);
    if (due.length) {
      this.bell?.ring(due, now, rules);
      const kinds = new Map(due.map(({ reminder, kind }) => [reminder.id, kind]));
      this.list = this.list.map(reminder => {
        const kind = kinds.get(reminder.id);
        if (!kind) return reminder;
        return kind === 'warn' ? { ...reminder, warned: true } : rang(reminder, now);
      });
    }
    if (shifted || due.length) this.save();
    this.setTimer(now, rules);
    for (const listener of this.listeners) listener();
  }

  private warnedAlready({ when, headsUp }: Pick<Draft, 'when' | 'headsUp'>, now: number): boolean {
    return !!when && !!headsUp && warnAt(when, headsUp, this.rules) <= now;
  }

  private held(kind: MomentKind): boolean {
    const { notifications, session } = this.extension;
    return notifications.heldBack || (!session.active && (kind === 'nag' || kind === 'nudge'));
  }

  private dueNow(now: number, rules: Rules): Due[] {
    return this.list.flatMap(reminder => {
      const moment = momentsOf(reminder, now, rules)[0];
      if (!moment || moment.at > now || moment.kind === 'roll' || this.held(moment.kind)) return [];
      return [{ reminder, kind: moment.kind }];
    });
  }

  private setTimer(now: number, rules: Rules): void {
    this.timer?.dispose();
    let next = this.list.some(({ when, doneAt }) => when && doneAt === null) ? nextMidnight(now) : Infinity;
    for (const reminder of this.list)
      for (const { at } of momentsOf(reminder, now, rules))
        if (at > now && at < next) next = at;
    this.timer = next === Infinity ? null : this.extension.timers.timeout(Math.min(next - now, LONGEST_TIMER_MS), () => this.refresh());
  }

  private replace(id: string, change: (reminder: Reminder) => Reminder): void {
    this.list = this.list.map(reminder => (reminder.id === id ? change(reminder) : reminder));
    this.changed();
  }

  private changed(): void {
    this.save();
    this.refresh();
  }

  private save(): void {
    if (this.writing) {
      this.writeAgain = true;
      return;
    }
    this.writing = true;
    const saved: Saved = { version: FORMAT, reminders: this.list };
    void this.extension.writeText(FILE, JSON.stringify(saved)).finally(() => {
      this.writing = false;
      if (!this.writeAgain) return;
      this.writeAgain = false;
      this.save();
    });
  }
}
