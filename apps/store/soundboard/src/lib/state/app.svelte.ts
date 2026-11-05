import { appearance, droppedPaths } from '@luft/ui';
import { t } from '@luft/i18n';
import { commands, events } from '#lib/bindings.js';
import type { Board, Hotkey, Library, Meters, Mix, Settings, Sound, Status } from '#lib/bindings.js';
import { toast } from './toast.svelte';

type Point = { x: number; y: number };
export type Menu = ({ kind: 'board'; board: Board } | { kind: 'sound'; sound: Sound }) & { at: Point };

class AppStore {
	library = $state.raw<Library>({ boards: [] });
	settings = $state.raw<Settings | null>(null);
	status = $state.raw<Status>({ connected: false, listeners: 0, microphones: [], passing: null, defaultInput: null, playing: [] });
	meters = $state.raw<Meters>({ voice: 0, output: 0 });
	triggers = $state.raw<Hotkey[]>([]);
	hotkeysAvailable = $state(false);
	soundsFolder = $state('');
	boardId = $state<number | null>(null);
	search = $state('');
	editing = $state<Sound | null>(null);
	menu = $state.raw<Menu | null>(null);
	renaming = $state.raw<Board | null>(null);
	removing = $state.raw<Board | null>(null);

	board: Board | null = $derived(this.library.boards.find((board) => board.id === this.boardId) ?? this.library.boards[0] ?? null);
	sounds: Sound[] = $derived.by(() => {
		const search = this.search.trim().toLowerCase();
		if (!search) return this.board?.sounds ?? [];
		return this.library.boards.flatMap((board) => board.sounds).filter((sound) => sound.name.toLowerCase().includes(search));
	});

	async start() {
		const state = await commands.appState();
		appearance.start(state);
		this.library = state.library;
		this.settings = state.settings;
		this.status = state.status;
		this.triggers = state.triggers;
		this.hotkeysAvailable = state.hotkeysAvailable;
		this.soundsFolder = state.soundsFolder;
		events.soundboardStatus((status) => (this.status = status));
		events.soundboardTriggers((triggers) => (this.triggers = triggers));
		events.soundboardMeters((meters) => (this.meters = meters));
	}

	keysOf(sound: Sound) {
		return this.triggers.find((trigger) => trigger.id === `sound-${sound.id}`)?.keys ?? null;
	}

	async addSounds() {
		const paths = await commands.chooseSounds({ title: t('sounds-choose-title'), filter: t('sounds-file-kind') }, { timeoutMs: 86_400_000 });
		if (paths.length) await this.add(paths);
	}

	dropped(transfer: DataTransfer) {
		const paths = droppedPaths(transfer);
		if (paths.length) void this.add(paths);
	}

	async add(paths: string[]) {
		if (!this.board) return;
		const before = this.board.sounds.length;
		const { library, failed } = await commands.addSounds({ board: this.board.id, paths });
		this.library = library;
		const added = (this.board?.sounds.length ?? before) - before;
		if (failed.length) toast.show(t('add-failed', { count: failed.length, name: failed[0] }), { failed: true });
		else toast.show(t('added', { count: added }));
	}

	async addBoard() {
		this.library = await commands.addBoard({ name: t('board-default-name') });
		this.boardId = this.library.boards.at(-1)?.id ?? null;
	}

	async renameBoard(board: number, name: string) {
		this.library = await commands.renameBoard({ board, name });
	}

	async removeBoard(board: number) {
		this.library = await commands.removeBoard({ board });
		if (this.boardId === board) this.boardId = null;
	}

	async exportBoard(board: Board) {
		await commands.exportBoard({ board: board.id, name: board.name, title: t('board-export') }, { timeoutMs: 86_400_000 });
	}

	async importBoard() {
		this.library = await commands.importBoard({ title: t('board-import'), filter: t('board-file-kind') }, { timeoutMs: 86_400_000 });
	}

	failed = (error: unknown) => toast.show(String(error), { failed: true });

	async save(sound: Sound) {
		this.library = await commands.updateSound(sound);
	}

	async removeSound(sound: Sound) {
		this.library = await commands.removeSound({ sound: sound.id });
	}

	setMix(change: Partial<Mix>) {
		if (!this.settings) return;
		const mix = { ...this.settings.mix, ...change };
		this.settings = { ...this.settings, mix };
		void commands.setMix(mix);
	}

	setKeepRunning(enabled: boolean) {
		if (this.settings) this.settings = { ...this.settings, keepRunning: enabled };
		void commands.setKeepRunning({ enabled });
	}

	setDefaultInput(enabled: boolean) {
		if (this.settings) this.settings = { ...this.settings, useAsDefault: enabled };
		void commands.setUseAsDefault({ enabled }).catch(this.failed);
	}
}

export const app = new AppStore();
