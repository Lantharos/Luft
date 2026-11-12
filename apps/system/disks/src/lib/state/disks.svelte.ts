import { SvelteSet } from 'svelte/reactivity';
import { appearance, errorText, Toasts } from '@luft/ui';
import { events as sabineEvents } from '@lantharos/sabine';
import { commands, events } from '#lib/bindings.js';
import type { Activation, Drive, ImageProgress, LuftRoom, Protection, Segment, Support, Volume } from '#lib/bindings.js';
import { CANCELLED } from '#lib/bridge/index.js';
import { dialogs } from '#lib/dialogs/dialogs.svelte.js';
import { inner, volumeName } from '#lib/format.js';
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
	protection = $state.raw<Protection>({ available: false, autoUnlock: '', drives: {}, systemResize: '' });
	loaded = $state(false);
	sysroot = $state('');
	readonly busy = new SvelteSet<string>();
	readonly notices = new Toasts(NOTICE_MS);
	readonly #offered = new Set<string>();

	drive = $derived(this.drives.find((drive) => drive.id === this.driveId) ?? this.drives[0] ?? null);

	async start() {
		const state = await commands.appState();
		appearance.start(state);
		events.disksChanged(({ drives }) => {
			const arrived = drives.some((drive) => !this.drives.some((known) => known.id === drive.id));
			this.drives = drives;
			systems.follow(drives);
			if (arrived) void this.#offerInterruptedMove();
		});
		events.disksImage((progress) => this.#imageProgress(progress));
		space.listen();
		events.disksTrust((protection) => (this.protection = protection));
		sabineEvents.singleInstance((activation) => void this.#locate(activation));
		const [{ drives }, formats, protection, sysroot] = await Promise.all([
			commands.disksSnapshot(),
			commands.disksFormats(),
			commands.trustState().catch(() => this.protection),
			commands.spaceLuftDrive()
		]);
		this.sysroot = sysroot;
		this.drives = drives;
		systems.follow(drives);
		this.formats = formats;
		this.protection = protection;
		this.loaded = true;
		await this.#locate(state.activation);
		await this.#offerInterruptedMove();
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

	holdsLuft(volume: Volume) {
		return inner(volume).mountPoints.includes(this.sysroot);
	}

	exploreVolume(volume: Volume) {
		const contents = inner(volume);
		const name = volumeName(volume);
		if (this.holdsLuft(volume)) void space.openLuft(this.sysroot, name).catch((caught) => this.fail(caught));
		else this.explore(contents.mountPoints[0], name);
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

	async #offerInterruptedMove() {
		const moves = await commands.disksInterruptedMoves().catch(() => []);
		const move = moves.find((candidate) => !this.#offered.has(candidate.id));
		if (!move || dialogs.current) return;
		this.#offered.add(move.id);
		const drive = this.drives.find((candidate) => candidate.block === move.drive);
		if (drive) this.select(drive.id);
		dialogs.open({ kind: 'finish-move', move });
	}

	async #offerRemoval(id: string) {
		await systems.load();
		const system = systems.find(id);
		if (!system) return;
		this.select(system.drive);
		dialogs.open({ kind: 'remove-system', system });
	}

	#offerLuftRoom() {
		const drive = this.drives.find((candidate) => candidate.luft.length > 0) ?? this.drives.find((candidate) => candidate.system);
		if (!drive) return;
		this.select(drive.id);
		const next = drive.luft.filter((room) => room.reach.kind !== 'apart');
		const room = (next.length ? next : drive.luft).reduce<LuftRoom | null>((best, candidate) => (best && best.size >= candidate.size ? best : candidate), null);
		if (room) dialogs.open({ kind: 'give-luft', drive, offset: room.offset, size: room.size });
	}

	async #locate(activation: Activation) {
		const located = await commands.disksLocate(activation).catch(() => null);
		if (located?.target) this.select(located.target.drive, located.target.block);
		if (located?.image) dialogs.open({ kind: 'write-image', image: located.image });
		if (located?.system) void this.#offerRemoval(located.system);
		if (located?.luft) this.#offerLuftRoom();
		if (located?.space) this.explore(located.space, located.space.split('/').filter(Boolean).at(-1) ?? located.space);
	}
}

export const disks = new Disks();
