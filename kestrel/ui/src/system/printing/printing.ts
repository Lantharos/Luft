import GLib from 'gi://GLib';

import { onLocaleChanged, t } from '../../shared/i18n/index.js';
import { ABORTED, COMPLETED, type Finished, type Job, PENDING, PrintingClient, PROCESSING, type Status, STOPPED } from './client.js';
import { PrintPanel, type View } from './panel.js';
import { PanelPlace } from './place.js';
import { connecting, problems } from './reasons.js';

const DONE_FOR = 3000;
const UNREACHABLE_AFTER = 60000;
const ACTIVE = [PENDING, PROCESSING, STOPPED];

const order = (job: Job) => (job.state === PROCESSING || job.state === STOPPED ? 0 : 1);

export class Printing {
  private readonly panel: PrintPanel;
  private readonly place: PanelPlace;
  private readonly client: PrintingClient;
  private readonly listeners = new Set<() => void>();
  private readonly forgetLocale: () => void;
  private jobs: Job[] = [];
  private readonly statuses = new Map<string, Status>();
  private readonly seen = new Set<number>();
  private seenProblems = new Set<string>();
  private readonly connectingSince = new Map<string, number>();
  private completed: Finished | null = null;
  private failed: Finished | null = null;
  private done: Finished | null = null;
  private dismissed = false;
  private printed = false;
  private refreshing = false;
  private refreshAgain = false;
  private doneTimer = 0;
  private unreachableTimer = 0;

  constructor() {
    this.panel = new PrintPanel({ close: () => this.dismiss(), cancel: job => this.cancel(job) });
    this.place = new PanelPlace(this.panel.actor);
    this.client = new PrintingClient({ changed: () => void this.refresh(), finished: finished => this.finished(finished) });
    this.forgetLocale = onLocaleChanged(() => this.render());
  }

  get busy(): boolean {
    return this.jobs.length > 0 || !!this.failed;
  }

  onChanged(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  reopen(): void {
    this.dismissed = false;
    this.render();
  }

  setAllowed(allowed: boolean): void {
    this.place.setAllowed(allowed);
  }

  private dismiss(): void {
    this.dismissed = true;
    this.printed = false;
    this.completed = null;
    this.failed = null;
    this.clearDone();
    this.render();
  }

  private cancel(job: Job): void {
    this.jobs = this.jobs.filter(queued => queued.id !== job.id);
    this.render();
    this.client.cancel(job).catch(error => console.warn(`Couldn't cancel printing ${job.id}: ${error}`)).finally(() => void this.refresh());
  }

  private finished(finished: Finished): void {
    if (finished.state === COMPLETED) this.completed = finished;
    if (finished.state === ABORTED) {
      this.failed = finished;
      this.dismissed = false;
    }
    void this.refresh();
  }

  private async refresh(): Promise<void> {
    if (this.refreshing) {
      this.refreshAgain = true;
      return;
    }
    this.refreshing = true;
    try {
      const jobs = (await this.client.jobs()).filter(job => ACTIVE.includes(job.state)).sort((a, b) => order(a) - order(b) || a.id - b.id);
      const printers = new Set([...jobs, ...[this.failed, this.completed].filter(shown => !!shown)].map(job => job.printer));
      const statuses = await Promise.all([...printers].map(async printer => [printer, await this.client.status(printer)] as const));
      this.update(jobs, new Map(statuses));
    } catch (error) {
      console.warn(`Couldn't read the print queue: ${error}`);
    }
    this.refreshing = false;
    if (!this.refreshAgain) return;
    this.refreshAgain = false;
    await this.refresh();
  }

  private update(jobs: Job[], statuses: Map<string, Status>): void {
    this.jobs = jobs;
    for (const [printer, status] of statuses) this.statuses.set(printer, status);
    if (jobs.some(job => !this.seen.has(job.id))) {
      this.dismissed = false;
      this.clearDone();
    }
    for (const job of jobs) this.seen.add(job.id);
    this.followProblems();
    if (!jobs.length && this.completed && this.printed) this.showDone(this.completed);
    this.render();
  }

  private followProblems(): void {
    const now = GLib.get_monotonic_time() / 1000;
    const shown = new Set<string>();
    for (const printer of new Set(this.jobs.map(job => job.printer))) {
      const reasons = this.statuses.get(printer)?.reasons ?? [];
      for (const problem of problems(reasons)) shown.add(`${printer}\n${problem.reason}`);
      if (!connecting(reasons)) this.connectingSince.delete(printer);
      else if (!this.connectingSince.has(printer)) this.connectingSince.set(printer, now);
    }
    if ([...shown].some(problem => !this.seenProblems.has(problem))) this.dismissed = false;
    this.seenProblems = shown;
    this.watchUnreachable(now);
  }

  private watchUnreachable(now: number): void {
    if (this.unreachableTimer) GLib.Source.remove(this.unreachableTimer);
    this.unreachableTimer = 0;
    const due = [...this.connectingSince.values()].map(since => since + UNREACHABLE_AFTER - now).filter(left => left > 0);
    if (!due.length) return;
    this.unreachableTimer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, Math.ceil(Math.min(...due)), () => {
      this.unreachableTimer = 0;
      this.render();
      return GLib.SOURCE_REMOVE;
    });
  }

  private unreachable(printer: string): boolean {
    const since = this.connectingSince.get(printer);
    return since !== undefined && GLib.get_monotonic_time() / 1000 - since >= UNREACHABLE_AFTER;
  }

  private showDone(finished: Finished): void {
    this.clearDone();
    this.printed = false;
    this.completed = null;
    this.done = finished;
    this.doneTimer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, DONE_FOR, () => {
      this.doneTimer = 0;
      this.done = null;
      this.render();
      return GLib.SOURCE_REMOVE;
    });
  }

  private clearDone(): void {
    if (this.doneTimer) GLib.Source.remove(this.doneTimer);
    this.doneTimer = 0;
    this.done = null;
  }

  private printerName(printer: string): string {
    return this.statuses.get(printer)?.description || printer;
  }

  private view(): View | null {
    const [current, ...queue] = this.jobs;
    const shown = current ?? this.failed ?? this.done;
    if (!shown) return null;
    const status = this.statuses.get(shown.printer);
    const printer = this.printerName(shown.printer);
    const base = {
      title: shown.name || t('printing-untitled'), current: current ?? null, queue, markers: status?.markers ?? [],
      problems: problems(status?.reasons ?? []), notes: [] as string[], printerOf: (job: Job) => this.printerName(job.printer),
    };
    if (!current) {
      const failed = shown === this.failed;
      return {
        ...base, look: failed ? 'failed' : 'done', progress: null, caption: '',
        subtitle: t(failed ? 'printing-failed' : 'printing-printed', { printer }),
      };
    }
    if (this.failed) base.notes.push(t('printing-failed-name', { name: this.failed.name || t('printing-untitled') }));
    if (this.unreachable(current.printer)) base.notes.push(t('printing-unreachable'));
    return { ...base, look: 'printing', subtitle: printer, ...this.progress(current) };
  }

  private progress(job: Job): Pick<View, 'progress' | 'caption'> {
    if (job.state === PENDING) return { progress: null, caption: t('printing-waiting') };
    if (job.state === STOPPED) return { progress: job.pages ? job.printed / job.pages : 0, caption: t('printing-stopped') };
    if (connecting(this.statuses.get(job.printer)?.reasons ?? [])) return { progress: null, caption: t('printing-connecting') };
    if (job.pages) return { progress: Math.min(1, job.printed / job.pages), caption: t('printing-pages', { printed: job.printed, pages: job.pages }) };
    return { progress: null, caption: job.printed ? t('printing-pages-printed', { printed: job.printed }) : t('printing-printing') };
  }

  private render(): void {
    const view = this.dismissed ? null : this.view();
    if (view) this.panel.show(view);
    if (view && this.jobs.length) this.printed = true;
    this.place.setOpen(!!view);
    for (const listener of [...this.listeners]) listener();
  }

  destroy(): void {
    this.clearDone();
    if (this.unreachableTimer) GLib.Source.remove(this.unreachableTimer);
    this.forgetLocale();
    this.client.destroy();
    this.listeners.clear();
    this.place.destroy();
    if (current === this) current = null;
  }
}

let current: Printing | null = null;

export function createPrinting(): Printing {
  return current = new Printing();
}

export const currentPrinting = (): Printing | null => current;
