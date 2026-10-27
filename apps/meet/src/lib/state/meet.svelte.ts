import { t } from '@luft/i18n';
import { Toasts } from '@luft/ui';
import { commands, events, type Channel, type Intent, type Packing, type Platform, type Progress, type Source, type Stage, type WindowsChoices } from '#lib/bindings.js';
import * as meet from '#lib/bridge/meet.js';
import type { Action, PlaceKind, Prepared, Report } from '#lib/bridge/meet.js';

export type Step = 'hello' | 'luft' | 'resize' | 'check' | 'room' | 'working' | 'ready' | 'box' | 'removed' | 'stick' | 'stickDone';
export type Task =
	| 'check'
	| 'room'
	| 'update'
	| 'download'
	| 'pack'
	| 'remove'
	| 'restart'
	| 'tidy'
	| 'firmware'
	| 'folders'
	| 'sticks'
	| 'stick'
	| 'offer'
	| 'luft'
	| 'resize'
	| 'cancel'
	| 'give';

export interface Failure {
	task: Task;
	declined: boolean;
	detail?: string;
	retry: () => unknown;
}

const ORDER: Step[] = ['hello', 'luft', 'resize', 'check', 'room', 'working', 'ready', 'box', 'stick', 'stickDone', 'removed'];
const GIB = 1024 ** 3;
const SHARE = 0.4;
const NOTE_SHOWN = 6000;
const CHANNEL_NOTES: Record<Channel, string> = {
	nightly: 'meet-channel-nightly',
	latest: 'meet-channel-latest'
};

class MeetState {
	platform = $state<Platform>('windows');
	step = $state<Step>('hello');
	direction = $state(1);
	report = $state<Report | null>(null);
	prepared = $state<Prepared | null>(null);
	progress = $state<Progress | null>(null);
	source = $state<Source>({ kind: 'download', channel: 'latest' });
	luft = $state(0);
	place = $state('windows');
	busy = $state(false);
	failure = $state<Failure | null>(null);
	readonly notes = new Toasts(NOTE_SHOWN);

	windows = $derived(this.report?.facts.platform === 'windows' ? this.report.facts : null);
	linux = $derived(this.report?.facts.platform === 'linux' ? this.report.facts : null);
	blocked = $derived(this.report?.findings.some((finding) => finding.level === 'blocks') ?? false);
	nightly = $derived(this.source.kind === 'download' && this.source.channel === 'nightly');
	places = $derived(this.windows?.places ?? []);
	chosen = $derived(this.places.find((place) => place.id === this.place) ?? this.places[0] ?? null);

	private inspection = 0;

	go(step: Step, direction = ORDER.indexOf(step) >= ORDER.indexOf(this.step) ? 1 : -1) {
		this.direction = direction;
		this.failure = null;
		this.step = step;
	}

	async run<T>(task: Task, work: () => Promise<T>, retry: () => unknown): Promise<T | null> {
		this.busy = true;
		this.failure = null;
		try {
			return await work();
		} catch (error) {
			console.error(`Meet Luft couldn't finish ${task}:`, error);
			const stage = this.progress?.stage;
			this.failure = {
				task: (task === 'room' || task === 'update' || task === 'stick') && stage === 'downloading' ? 'download' : task,
				declined: error instanceof meet.Failed && error.failure === 'declined',
				detail: error instanceof Error ? error.message : undefined,
				retry
			};
			return null;
		} finally {
			this.busy = false;
		}
	}

	private async inspect() {
		const inspection = ++this.inspection;
		const report = await this.run('check', () => meet.check($state.snapshot(this.source)), () => this.check());
		if (!report || inspection !== this.inspection) return null;
		this.report = report;
		this.prepared = report.prepared;
		if (report.facts.platform === 'windows') {
			const { places, windowsSize } = report.facts;
			if (!places.some((place) => place.id === this.place)) this.place = places[0]?.id ?? 'windows';
			const beside = places.find((place) => place.kind === 'windows');
			if (beside) {
				const suggested = Math.round((windowsSize * SHARE) / GIB) * GIB;
				this.luft = Math.min(beside.most, Math.max(beside.smallest, suggested));
			}
		}
		return report;
	}

	async check() {
		this.go('check');
		this.report = null;
		const report = await this.inspect();
		if (report?.prepared) this.go('ready');
	}

	async switchChannel() {
		if (this.step === 'working') return;
		const channel: Channel = this.nightly ? 'latest' : 'nightly';
		this.source = { kind: 'download', channel };
		this.notes.show(t(CHANNEL_NOTES[channel]), { action: { label: t('meet-undo'), run: () => this.switchChannel() } });
		if (this.step === 'check') {
			this.report = null;
			await this.inspect();
		} else if (this.step === 'room') {
			await this.inspect();
			if (this.blocked) this.go('check');
		} else if (this.step === 'ready') {
			await this.inspect();
		}
	}

	async saveLogs() {
		try {
			const saved = await meet.saveLogs();
			if (saved) this.notes.show(t('meet-logs-saved'), { action: { label: t('meet-logs-show'), run: () => meet.showFile(saved) } });
			else this.notes.show(t('meet-logs-none'));
		} catch (error) {
			console.error("Meet Luft couldn't save Try Luft's logs:", error);
			this.notes.show(t('meet-logs-failed'));
		}
	}

	async chooseIso() {
		const path = await meet.pickIso().catch(() => null);
		if (!path) return;
		this.source = { kind: 'file', path };
		await this.check();
	}

	async working<T>(task: Task, first: Stage, work: () => Promise<T>, retry: () => unknown, after: Step, back: Step) {
		this.progress = { stage: first, done: 0, total: 0 };
		this.go('working', 1);
		const result = await this.run(task, work, retry);
		this.progress = null;
		if (result === null && this.failure) {
			const failure = this.failure;
			this.go(back);
			this.failure = failure;
			return null;
		}
		this.go(after);
		return result;
	}

	async makeRoom() {
		const first: Record<PlaceKind, Stage> = { windows: 'shrinking', free: 'partitioning', whole: 'erasing' };
		const prepared = await this.working(
			'room',
			first[this.chosen?.kind ?? 'windows'],
			() => meet.prepare(this.luft, $state.snapshot(this.source), this.place),
			() => this.makeRoom(),
			'ready',
			'room'
		);
		if (prepared) this.prepared = prepared;
	}

	async getReady() {
		const prepared = await this.working(
			'room',
			'downloading',
			() => meet.prepare(0, $state.snapshot(this.source), ''),
			() => this.getReady(),
			'ready',
			'check'
		);
		if (prepared) this.prepared = prepared;
	}

	async update() {
		const prepared = await this.working(
			'update',
			'downloading',
			() => meet.refresh($state.snapshot(this.source)),
			() => this.update(),
			'ready',
			'ready'
		);
		if (!prepared) return;
		this.prepared = prepared;
		if (this.report) this.report.outdated = false;
	}

	async pack(packing: Packing) {
		const prepared = await this.working('pack', 'packing', () => meet.pack(packing), () => this.pack(packing), 'ready', 'box');
		if (prepared) this.prepared = prepared;
	}

	async remove() {
		await this.working('remove', 'removing', () => meet.undo().then(() => true), () => this.remove(), 'removed', 'ready');
	}

	async restart(intent: Intent, windows: WindowsChoices): Promise<void> {
		await this.run('restart', () => meet.restart(intent, windows), () => this.restart(intent, windows));
	}

	async act(action: Action): Promise<void> {
		if (action === 'chooseIso') return this.chooseIso();
		if (action === 'firmwareSettings') {
			await this.run('firmware', () => meet.firmwareSettings(), () => this.act(action));
			return;
		}
		const tidied = await this.run('tidy', () => meet.tidy().then(() => true), () => this.act(action));
		if (tidied !== null) await this.check();
	}

	listen() {
		void commands.meetSource().then((source) => (this.source = source));
		void commands.meetPlatform().then((platform) => (this.platform = platform));
		return events.meetProgress((progress) => (this.progress = progress));
	}
}

export const session = new MeetState();
