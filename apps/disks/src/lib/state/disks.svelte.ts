import { SvelteSet } from 'svelte/reactivity';
import { appearance } from '@luft/ui';
import * as api from '$lib/api';
import type { Drive, ImageProgress, Segment, Support } from '$lib/api';
import { dialogs } from '$lib/dialogs/dialogs.svelte';
import { errorText } from '$lib/format';

const NOTICE_MS = 6000;

export function segmentKey(segment: Segment) {
	return segment.kind === 'free' ? `free:${segment.offset}` : segment.block;
}

class Disks {
	drives = $state.raw<Drive[]>([]);
	formats = $state.raw<Support[]>([]);
	driveId = $state<string | null>(null);
	segmentId = $state<string | null>(null);
	image = $state.raw<ImageProgress | null>(null);
	notice = $state<string | null>(null);
	loaded = $state(false);
	readonly busy = new SvelteSet<string>();

	drive = $derived(this.drives.find((drive) => drive.id === this.driveId) ?? this.drives[0] ?? null);
	segment = $derived(this.drive?.segments.find((segment) => segmentKey(segment) === this.segmentId) ?? this.drive?.segments[0] ?? null);

	#noticeTimer: ReturnType<typeof setTimeout> | undefined;

	async start() {
		const state = await api.appState();
		appearance.start(state);
		api.events.changed(({ drives }) => (this.drives = drives));
		api.events.image((progress) => this.#imageProgress(progress));
		api.events.activated(({ arguments: args }) => void this.#locate(args));
		const [{ drives }, formats] = await Promise.all([api.snapshot(), api.formats()]);
		this.drives = drives;
		this.formats = formats;
		this.loaded = true;
		await this.#locate(state.arguments);
	}

	select(drive: string, segment: string | null = null) {
		this.driveId = drive;
		this.segmentId = segment;
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
	}
}

export const disks = new Disks();
