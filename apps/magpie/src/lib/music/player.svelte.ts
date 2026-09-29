import type { MediaAction, Playback, Repeat } from '$lib/api';
import * as api from '$lib/api';
import { fileSource } from '$lib/bridge';
import { mediaSession, type MediaOwner } from '$lib/playback/session';
import { volume } from '$lib/playback/volume.svelte';
import { albumOrder, shuffled, trackArtist, trackFrom, trackTitle, type Track } from './queue';

const HANDOFF_WINDOW = 0.6;
const HANDOFF_EARLY = 0.012;
const RESTART_AFTER = 3;
const EVENTS = ['play', 'pause', 'timeupdate', 'durationchange', 'ended', 'seeked', 'error'] as const;

class Player implements MediaOwner {
	queue = $state.raw<Track[]>([]);
	index = $state(-1);
	order = $state.raw<number[]>([]);
	shuffle = $state(false);
	repeat = $state<Repeat>('None');
	paused = $state(true);
	time = $state(0);
	duration = $state(0);
	failed = $state(false);

	track = $derived<Track | null>(this.queue[this.index] ?? null);
	playing = $derived(!this.paused && this.track !== null);
	position = $derived(this.order.indexOf(this.index));
	hasNext = $derived(this.repeat === 'Playlist' ? this.queue.length > 1 : this.position < this.order.length - 1);
	hasPrevious = $derived(this.position > 0 || this.repeat === 'Playlist');

	#decks: HTMLAudioElement[] = [];
	#active = 0;
	#handoff: ReturnType<typeof setTimeout> | undefined;
	#serial = 0;

	get #current() {
		return this.#decks[this.#active];
	}

	get #standby() {
		return this.#decks[1 - this.#active];
	}

	async load(paths: string[], start: string) {
		const tracks = albumOrder((await api.audioTags(paths)).map(trackFrom));
		this.queue = tracks;
		const index = tracks.findIndex((track) => track.path === start);
		this.#reorder(index);
		this.#start(index);
	}

	async enqueue(paths: string[]) {
		const known = new Set(this.queue.map((track) => track.path));
		const fresh = paths.filter((path) => !known.has(path));
		if (!fresh.length) return 0;
		const tracks = (await api.audioTags(fresh)).map(trackFrom);
		const first = this.queue.length;
		this.queue = [...this.queue, ...tracks];
		this.order = [...this.order, ...tracks.map((_, offset) => first + offset)];
		this.#prepareStandby();
		mediaSession.update(this);
		return tracks.length;
	}

	has(path: string) {
		return this.queue.some((track) => track.path === path);
	}

	jump(index: number) {
		if (index === this.index) return this.#current?.paused && this.play();
		this.#start(index);
	}

	jumpTo(path: string) {
		const index = this.queue.findIndex((track) => track.path === path);
		if (index >= 0) this.jump(index);
	}

	play() {
		void this.#current?.play();
	}

	pause() {
		this.#current?.pause();
	}

	toggle() {
		if (this.#current?.paused) this.play();
		else this.pause();
	}

	next() {
		const next = this.#neighbor(1);
		if (next !== null) this.#start(next);
	}

	previous() {
		if (this.time > RESTART_AFTER || !this.hasPrevious) return this.seek(0);
		const previous = this.#neighbor(-1);
		if (previous !== null) this.#start(previous);
	}

	seek(time: number) {
		const deck = this.#current;
		if (!deck) return;
		deck.currentTime = Math.min(Math.max(0, time), this.duration || time);
		this.time = deck.currentTime;
		this.#disarm();
	}

	setShuffle(shuffle: boolean) {
		this.shuffle = shuffle;
		this.#reorder(this.index);
		this.#prepareStandby();
		mediaSession.update(this);
	}

	setRepeat(repeat: Repeat) {
		this.repeat = repeat;
		if (this.#current) this.#current.loop = repeat === 'Track';
		this.#prepareStandby();
		mediaSession.update(this);
	}

	cycleRepeat() {
		this.setRepeat(this.repeat === 'None' ? 'Playlist' : this.repeat === 'Playlist' ? 'Track' : 'None');
	}

	applyVolume() {
		for (const deck of this.#decks) {
			deck.volume = volume.level;
			deck.muted = volume.muted;
		}
		mediaSession.update(this);
	}

	stop() {
		this.#disarm();
		for (const deck of this.#decks) {
			deck.pause();
			deck.removeAttribute('src');
			deck.load();
		}
		this.queue = [];
		this.index = -1;
		this.order = [];
		mediaSession.release(this);
	}

	playback(): Playback {
		const track = this.track;
		return {
			track: this.#serial,
			status: !track ? 'Stopped' : this.paused ? 'Paused' : 'Playing',
			title: track && trackTitle(track),
			artist: track && trackArtist(track),
			album: track?.album ?? null,
			art: track?.art ?? null,
			path: track?.path ?? null,
			length: this.duration > 0 && Number.isFinite(this.duration) ? this.duration : track?.duration ?? null,
			position: this.#current?.currentTime ?? 0,
			rate: 1,
			volume: volume.muted ? 0 : volume.level,
			shuffle: this.shuffle,
			repeat: this.repeat,
			canNext: this.hasNext,
			canPrevious: this.hasPrevious || this.time > RESTART_AFTER
		};
	}

	handle(action: MediaAction) {
		if (action.action === 'play') this.play();
		else if (action.action === 'pause' || action.action === 'stop') this.pause();
		else if (action.action === 'toggle') this.toggle();
		else if (action.action === 'next') this.next();
		else if (action.action === 'previous') this.previous();
		else if (action.action === 'seek') this.seek(this.time + action.value);
		else if (action.action === 'position') this.seek(action.value);
		else if (action.action === 'volume') volume.level = action.value;
		else if (action.action === 'shuffle') this.setShuffle(action.value);
		else if (action.action === 'repeat') this.setRepeat(action.value);
	}

	#ensureDecks() {
		if (this.#decks.length) return;
		this.#decks = [new Audio(), new Audio()];
		this.#decks.forEach((deck, index) => {
			deck.preload = 'auto';
			for (const event of EVENTS) deck.addEventListener(event, () => index === this.#active && this.#event(event));
		});
		this.applyVolume();
	}

	#event(event: (typeof EVENTS)[number]) {
		const deck = this.#current;
		if (event === 'timeupdate') return this.#progress(deck);
		if (event === 'durationchange') this.duration = deck.duration;
		else if (event === 'ended') return this.#finished();
		else if (event === 'error') this.failed = true;
		else this.paused = deck.paused;
		if (event === 'play') mediaSession.claim(this);
		else mediaSession.update(this);
	}

	#progress(deck: HTMLAudioElement) {
		this.time = deck.currentTime;
		const remaining = (deck.duration - deck.currentTime) / (deck.playbackRate || 1);
		if (this.#handoff || deck.paused || deck.loop || !(remaining < HANDOFF_WINDOW)) return;
		const next = this.#neighbor(1);
		if (next === null || this.#standby.dataset.path !== this.queue[next]?.path) return;
		this.#handoff = setTimeout(() => this.#start(next), Math.max(0, remaining - HANDOFF_EARLY) * 1000);
	}

	#finished() {
		if (this.#handoff) return;
		const next = this.#neighbor(1);
		if (next === null) {
			this.paused = true;
			mediaSession.update(this);
			return;
		}
		this.#start(next);
	}

	#start(index: number) {
		const track = this.queue[index];
		if (!track) return;
		this.#ensureDecks();
		this.#disarm();
		const previous = this.#current;
		if (this.#standby.dataset.path === track.path) this.#active = 1 - this.#active;
		const deck = this.#current;
		if (deck.dataset.path !== track.path) {
			deck.dataset.path = track.path;
			deck.src = fileSource(track.path);
		}
		if (previous !== deck) previous.pause();
		deck.currentTime = 0;
		deck.loop = this.repeat === 'Track';
		this.index = index;
		this.failed = false;
		this.time = 0;
		this.duration = deck.duration || track.duration || 0;
		this.#serial += 1;
		void deck.play();
		this.#prepareStandby();
		mediaSession.claim(this);
	}

	#prepareStandby() {
		const next = this.#neighbor(1);
		const standby = this.#standby;
		const path = next === null ? null : this.queue[next].path;
		if (!standby || !path || standby.dataset.path === path) return;
		standby.pause();
		standby.dataset.path = path;
		standby.src = fileSource(path);
		standby.load();
	}

	#neighbor(step: 1 | -1) {
		const count = this.order.length;
		if (!count) return null;
		const position = this.position + step;
		if (position >= 0 && position < count) return this.order[position];
		return this.repeat === 'Playlist' ? this.order[(position + count) % count] : null;
	}

	#reorder(current: number) {
		this.order = this.shuffle ? shuffled(this.queue.length, current) : this.queue.map((_, index) => index);
	}

	#disarm() {
		clearTimeout(this.#handoff);
		this.#handoff = undefined;
	}
}

export const player = new Player();
