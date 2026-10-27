import { Failed, pickIso } from '#lib/bridge/meet.js';
import * as api from '#lib/bridge/stick.js';
import type { Way } from '#lib/bindings.js';
import type { Finished, Offer, Room, Stick } from '#lib/bridge/stick.js';
import { session, type Failure, type Step } from '#lib/state/meet.svelte.js';

const LOOK_EVERY = 2500;

export interface Made extends Finished {
	ventoy: boolean;
}

class StickState {
	sticks = $state<Stick[] | null>(null);
	offer = $state<Offer | null>(null);
	chosen = $state<string | null>(null);
	made = $state<Made | null>(null);
	problem = $state<Failure | null>(null);
	unavailable = $state<Failure | null>(null);
	from = $state<Step>('hello');
	making = $state(false);

	stick = $derived(this.sticks?.find((stick) => stick.id === this.chosen) ?? null);

	private looking = false;
	private offered = '';

	open() {
		if (session.step !== 'stickDone') this.from = session.step;
		this.made = null;
		session.go('stick');
	}

	back() {
		session.go(this.from);
	}

	private iso() {
		return session.source.kind === 'file' ? session.source.path : null;
	}

	async look() {
		if (this.looking) return;
		this.looking = true;
		try {
			const found = await api.sticks(this.iso());
			this.problem = null;
			this.sticks = found.sticks;
			if (!found.sticks.some((stick) => stick.id === this.chosen)) this.chosen = null;
			await this.refreshOffer();
		} catch (error) {
			console.error('Meet Luft couldn’t look for USB drives:', error);
			this.problem = {
				task: 'sticks',
				declined: error instanceof Failed && error.failure === 'declined',
				retry: () => this.look()
			};
		} finally {
			this.looking = false;
		}
	}

	private async refreshOffer() {
		const asked = JSON.stringify($state.snapshot(session.source));
		if (asked === this.offered && this.offer) return;
		this.offered = asked;
		this.offer = null;
		this.unavailable = null;
		try {
			const offer = await api.offer($state.snapshot(session.source));
			if (asked !== this.offered) return;
			this.offer = offer;
		} catch (error) {
			console.error('Luft can’t be downloaded right now:', error);
			this.offered = '';
			this.unavailable = { task: 'offer', declined: false, retry: () => this.look() };
		}
	}

	watch() {
		void this.look();
		const timer = setInterval(() => {
			if (!this.problem) void this.look();
		}, LOOK_EVERY);
		return () => clearInterval(timer);
	}

	room(stick: Stick, needed: number): Promise<Room | null> {
		return session.run('stick', () => api.room(stick.id, needed), () => this.room(stick, needed));
	}

	async chooseIso() {
		const path = await pickIso().catch(() => null);
		if (!path) return;
		session.source = { kind: 'file', path };
		await this.look();
	}

	async make(stick: Stick, way: Way) {
		const making = {
			source: $state.snapshot(session.source),
			stick: stick.id,
			way
		};
		this.making = true;
		const finished = await session.working(
			'stick',
			this.offer?.kept ? (way.kind === 'erase' ? 'writing' : 'copying') : 'downloading',
			() => api.make(making),
			() => this.make(stick, way),
			'stickDone',
			'stick'
		);
		this.making = false;
		if (finished) this.made = { ...finished, ventoy: way.kind === 'ventoy' };
		this.offered = '';
	}
}

export const maker = new StickState();
