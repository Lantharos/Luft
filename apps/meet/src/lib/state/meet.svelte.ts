import * as meet from '#lib/api/meet.js';
import type { Action, Intent, Packing, Prepared, Progress, Report, Source, Stage, WindowsChoices } from '#lib/api/meet.js';

export type Step = 'hello' | 'check' | 'room' | 'working' | 'ready' | 'box' | 'removed';

const ORDER: Step[] = ['hello', 'check', 'room', 'working', 'ready', 'box', 'removed'];
const GIB = 1024 ** 3;
const SHARE = 0.4;

class MeetState {
	step = $state<Step>('hello');
	direction = $state(1);
	report = $state<Report | null>(null);
	prepared = $state<Prepared | null>(null);
	progress = $state<Progress | null>(null);
	source = $state<Source>({ kind: 'download', channel: 'latest' });
	luft = $state(0);
	busy = $state(false);
	error = $state('');

	blocked = $derived(this.report?.findings.some((finding) => finding.level === 'blocks') ?? false);

	go(step: Step) {
		this.direction = ORDER.indexOf(step) >= ORDER.indexOf(this.step) ? 1 : -1;
		this.error = '';
		this.step = step;
	}

	private async run<T>(work: () => Promise<T>): Promise<T | null> {
		this.busy = true;
		this.error = '';
		try {
			return await work();
		} catch (error) {
			this.error = meet.message(error);
			return null;
		} finally {
			this.busy = false;
		}
	}

	async check() {
		this.go('check');
		this.report = null;
		const report = await this.run(() => meet.check($state.snapshot(this.source)));
		if (!report) return;
		this.report = report;
		this.prepared = report.prepared;
		const suggested = Math.round((report.facts.windowsSize * SHARE) / GIB) * GIB;
		this.luft = Math.min(report.mostLuft, Math.max(report.smallestLuft, suggested));
		if (report.prepared) this.go('ready');
	}

	async chooseIso() {
		const path = await meet.pickIso().catch(() => null);
		if (!path) return;
		this.source = { kind: 'file', path };
		await this.check();
	}

	private async working<T>(first: Stage, work: () => Promise<T>, after: 'ready' | 'removed', back: 'room' | 'ready' | 'box') {
		this.progress = { stage: first, done: 0, total: 0 };
		this.go('working');
		const result = await this.run(work);
		this.progress = null;
		if (result === null && this.error) {
			const error = this.error;
			this.go(back);
			this.error = error;
			return null;
		}
		this.go(after);
		return result;
	}

	async makeRoom() {
		const prepared = await this.working('shrinking', () => meet.prepare(this.luft, $state.snapshot(this.source)), 'ready', 'room');
		if (prepared) this.prepared = prepared;
	}

	async pack(packing: Packing) {
		const prepared = await this.working('packing', () => meet.pack(packing), 'ready', 'box');
		if (prepared) this.prepared = prepared;
	}

	async remove() {
		await this.working('removing', () => meet.undo().then(() => true), 'removed', 'ready');
	}

	restart(intent: Intent, windows: WindowsChoices) {
		return this.run(() => meet.restart(intent, windows));
	}

	async act(action: Action) {
		if (action === 'chooseIso') return this.chooseIso();
		if (action === 'firmwareSettings') return this.run(() => meet.firmwareSettings());
		await this.run(() => meet.tidy());
		await this.check();
	}

	listen() {
		void meet.defaultSource().then((source) => (this.source = source));
		return meet.onProgress((progress) => (this.progress = progress));
	}
}

export const session = new MeetState();
