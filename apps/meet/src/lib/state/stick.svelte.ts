import { Failed, pickIso } from '#lib/api/meet.js';
import * as api from '#lib/api/stick.js';
import type { Edition, Finished, Offer, Room, Stick, Variant, Way } from '#lib/api/stick.js';
import { session, type Failure, type Step } from '#lib/state/meet.svelte.js';

const LOOK_EVERY = 2500;

export interface Made extends Finished {
	ventoy: boolean;
}

class StickState {
	sticks = $state<Stick[] | null>(null);
	variant = $state<Variant>('standard');
	offers = $state<Offer[] | null>(null);
	chosen = $state<string | null>(null);
	edition = $state<Edition>('universal');
	made = $state<Made | null>(null);
	problem = $state<Failure | null>(null);
	unavailable = $state<Failure | null>(null);
	from = $state<Step>('hello');
	making = $state(false);

	stick = $derived(this.sticks?.find((stick) => stick.id === this.chosen) ?? null);
	offer = $derived(this.offers?.find((offer) => offer.edition === this.edition) ?? this.offers?.[0] ?? null);

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
			this.variant = found.variant;
			if (!found.sticks.some((stick) => stick.id === this.chosen)) this.chosen = null;
			await this.refreshOffers();
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

	private async refreshOffers() {
		const asked = JSON.stringify([$state.snapshot(session.source), this.variant]);
		if (asked === this.offered && this.offers) return;
		this.offered = asked;
		this.offers = null;
		this.unavailable = null;
		try {
			const offers = await api.offers($state.snapshot(session.source), this.variant);
			if (asked !== this.offered) return;
			this.offers = offers;
			if (!offers.some((offer) => offer.edition === this.edition)) this.edition = offers[0].edition;
		} catch (error) {
			console.error('Luft can’t be downloaded right now:', error);
			this.offered = '';
			this.unavailable = { task: 'offers', declined: false, retry: () => this.look() };
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
			edition: this.offer?.edition ?? 'universal',
			variant: this.variant,
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
