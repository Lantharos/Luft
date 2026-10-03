import { SvelteSet } from 'svelte/reactivity';
import { appearance } from '@luft/ui';
import * as api from '#lib/api.js';
import type { Drive, ImageProgress, Protection, Segment, Support, Volume } from '#lib/api.js';
import { dialogs } from '#lib/dialogs/dialogs.svelte.js';
import { errorText } from '#lib/format.js';
import { space } from './space.svelte';

const NOTICE_MS = 6000;

export function segmentKey(segment: Segment) {
	return segment.kind === 'free' ? `free:${segment.offset}` : segment.block;
}

class Disks {
	drives = $state.raw<Drive[]>([]);
	formats = $state.raw<Support[]>([]);
	driveId = $state<string | null>(null);
	current = $state<string | null>(null);
	hovered = $state<string | null>(null);
	image = $state.raw<ImageProgress | null>(null);
	protection = $state.raw<Protection>({ available: false, autoUnlock: '', drives: {} });
	notice = $state<string | null>(null);
	loaded = $state(false);
	readonly busy = new SvelteSet<string>();

	drive = $derived(this.drives.find((drive) => drive.id === this.driveId) ?? this.drives[0] ?? null);

	#noticeTimer: ReturnType<typeof setTimeout> | undefined;

	async start() {
		const state = await api.appState();
		appearance.start(state);
		api.events.changed(({ drives }) => (this.drives = drives));
		api.events.image((progress) => this.#imageProgress(progress));
		space.listen();
		api.events.trust((protection) => (this.protection = protection));
		api.events.activated(({ arguments: args }) => void this.#locate(args));
		const [{ drives }, formats, protection] = await Promise.all([api.snapshot(), api.formats(), api.trust.state().catch(() => this.protection)]);
		this.drives = drives;
		this.formats = formats;
		this.protection = protection;
		this.loaded = true;
		await this.#locate(state.arguments);
	}

	select(drive: string, segment: string | null = null) {
		this.driveId = drive;
		this.current = segment;
		this.hovered = null;
		space.close();
	}

	explore(path: string, name: string) {
		void space.open(path, name).catch((caught) => this.fail(caught));
	}

	encryption(volume: Volume) {
		return volume.encryption ? (this.protection.drives[volume.uuid] ?? null) : null;
	}

	support(filesystem: string) {
		return this.formats.find((format) => format.filesystem === filesystem);
	}

	async run(key: string, action: () => Promise<unknown>) {
		this.busy.add(key);
		try {
			await action();
			return true;
		} catch (caught) {
			this.fail(caught);
			return false;
		} finally {
			this.busy.delete(key);
		}
	}

	fail(caught: unknown) {
		const message = errorText(caught);
		if (message === api.CANCELLED) return;
		this.notice = message;
		clearTimeout(this.#noticeTimer);
		this.#noticeTimer = setTimeout(() => (this.notice = null), NOTICE_MS);
	}

	#imageProgress(progress: ImageProgress) {
		if (progress.finished && progress.error) {
			this.image = null;
			this.fail(progress.error);
			return;
		}
		this.image = progress;
	}

	async #locate(args: string[]) {
		const located = await api.locate(args).catch(() => null);
		if (located?.target) this.select(located.target.drive, located.target.block);
		if (located?.image) dialogs.open({ kind: 'write-image', image: located.image });
		if (located?.space) this.explore(located.space, located.space.split('/').filter(Boolean).at(-1) ?? located.space);
	}
}

export const disks = new Disks();
