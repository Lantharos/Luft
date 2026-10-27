import { SvelteSet } from 'svelte/reactivity';
import { appearance, errorText, Toasts } from '@luft/ui';
import { events as sabineEvents } from '@lantharos/sabine';
import { commands, events } from '#lib/bindings.js';
import type { Activation, Drive, ImageProgress, Protection, Segment, Support, Volume } from '#lib/bindings.js';
import { CANCELLED } from '#lib/bridge/index.js';
import { dialogs } from '#lib/dialogs/dialogs.svelte.js';
import { space } from './space.svelte';
import { systems } from './systems.svelte';

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
	loaded = $state(false);
	readonly busy = new SvelteSet<string>();
	readonly notices = new Toasts(NOTICE_MS);

	drive = $derived(this.drives.find((drive) => drive.id === this.driveId) ?? this.drives[0] ?? null);

	async start() {
		const state = await commands.appState();
		appearance.start(state);
		events.disksChanged(({ drives }) => {
			this.drives = drives;
			systems.follow(drives);
		});
		events.disksImage((progress) => this.#imageProgress(progress));
		space.listen();
		events.disksTrust((protection) => (this.protection = protection));
		sabineEvents.singleInstance((activation) => void this.#locate(activation));
		const [{ drives }, formats, protection] = await Promise.all([commands.disksSnapshot(), commands.disksFormats(), commands.trustState().catch(() => this.protection)]);
		this.drives = drives;
		systems.follow(drives);
		this.formats = formats;
		this.protection = protection;
		this.loaded = true;
		await this.#locate(state.activation);
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
		if (message === CANCELLED) return;
		this.notices.show(message, { failed: true });
	}

	#imageProgress(progress: ImageProgress) {
		if (progress.finished && progress.error) {
			this.image = null;
			this.fail(progress.error);
			return;
		}
		this.image = progress;
	}

	async #offerRemoval(id: string) {
		await systems.load();
		const system = systems.find(id);
		if (!system) return;
		this.select(system.drive);
		dialogs.open({ kind: 'remove-system', system });
	}

	async #locate(activation: Activation) {
		const located = await commands.disksLocate(activation).catch(() => null);
		if (located?.target) this.select(located.target.drive, located.target.block);
		if (located?.image) dialogs.open({ kind: 'write-image', image: located.image });
		if (located?.system) void this.#offerRemoval(located.system);
		if (located?.space) this.explore(located.space, located.space.split('/').filter(Boolean).at(-1) ?? located.space);
	}
}

export const disks = new Disks();
