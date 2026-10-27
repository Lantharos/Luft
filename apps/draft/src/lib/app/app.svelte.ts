import { appWindow, events as sabineEvents } from '@lantharos/sabine';
import { appearance, PaletteState } from '@luft/ui';
import { tick } from 'svelte';
import { commands, events } from '#lib/bindings.js';
import { CHOOSER, readStore, takeOpenedFiles } from '#lib/bridge/index.js';
import { buildCommands, type Command } from '#lib/commands/registry.js';
import { checkAll, filesChanged, watchedFolders } from '#lib/documents/disk.js';
import type { Document } from '#lib/documents/document.svelte.js';
import { newDocument, openPath } from '#lib/documents/opening.js';
import { restoreSession, sessionName, sessionWriter, writeSession, type Session } from '#lib/documents/session.js';
import { Workspace } from '#lib/documents/workspace.svelte.js';
import { FileIndex } from '#lib/files/index.svelte.js';
import { Menus } from '#lib/app/menus.svelte.js';
import { quickOpen } from '#lib/palette/sources.js';
import { FONT_SIZES, SettingsStore } from '#lib/app/settings.svelte.js';
import { debounce } from '#lib/utils/debounce.js';

const WATCH_DELAY_MS = 150;
const DEFAULT_FONT_SIZE = 14;

export class App {
	readonly settings = new SettingsStore();
	readonly palette = new PaletteState();
	readonly menus = new Menus();
	readonly workspace: Workspace;
	readonly files: FileIndex;
	readonly commands: Command[];
	ready = $state(false);
	configured = $state(false);
	markdown = $derived.by(() => this.workspace.active?.language === 'Markdown');
	#persist: ReturnType<typeof sessionWriter>;
	#watch: ReturnType<typeof debounce>;
	#watched = '';

	constructor() {
		this.workspace = new Workspace(this.settings, () => this.#changed());
		this.files = new FileIndex();
		this.commands = buildCommands(this);
		this.#persist = sessionWriter(this.workspace);
		this.#watch = debounce(() => this.#syncWatches(), WATCH_DELAY_MS);
	}

	async start() {
		this.#listen();
		const [state, opened] = await Promise.all([commands.appState(), takeOpenedFiles(), this.settings.load()]);
		this.workspace.browsing = state.folders.length > 0 || opened.length === 0;
		this.configured = true;
		const session = await readStore<Session>(sessionName(this.workspace.browsing));
		appearance.start(state);
		this.workspace.editor.setWrap(this.settings.value.wrap);
		this.workspace.home = state.home;
		this.workspace.backups.folder = state.backups;
		await restoreSession(this.workspace, session, state.folders[0] ?? null);
		await this.openPaths(opened);
		this.ready = true;
		if (this.workspace.active) void tick().then(() => this.workspace.editor.focus());
	}

	#listen() {
		sabineEvents.openUrlsAvailable(async () => this.openPaths(await takeOpenedFiles()));
		events.draftFiles(({ paths }) => {
			this.files.invalidate();
			void filesChanged(this.workspace, paths);
		});
		sabineEvents.singleInstance(async (activation) => {
			const [folder] = await commands.activationFolders(activation);
			if (folder) await this.workspace.showFolder(folder);
		});
	}

	#changed() {
		this.#persist();
		this.#watch();
	}

	#syncWatches() {
		const folders = watchedFolders(this.workspace);
		const key = folders.join('\n');
		if (key === this.#watched) return;
		this.#watched = key;
		void commands.watch({ paths: folders });
	}

	async openPaths(paths: string[]) {
		for (const [index, path] of paths.entries()) {
			const document = await openPath(this.workspace, path, { activate: index === paths.length - 1 });
			if (document) void this.reveal(document);
		}
	}

	async openDropped(paths: string[]) {
		const stats = await Promise.all(paths.map((path) => commands.fileStat({ path })));
		const folder = paths.find((_, index) => !stats[index]);
		if (folder) await this.workspace.showFolder(folder);
		await this.openPaths(paths.filter((_, index) => stats[index]));
	}

	newFile() {
		newDocument(this.workspace);
	}

	async openFiles() {
		const folder = this.workspace.tree.root ?? this.workspace.home;
		await this.openPaths(await commands.chooseFiles({ folder }, CHOOSER).catch(() => []));
	}

	async openFolder() {
		const folder = await commands.chooseFolder({ folder: this.workspace.tree.root ?? this.workspace.home }, CHOOSER).catch(() => null);
		if (folder) await this.workspace.showFolder(folder);
	}

	showQuickOpen() {
		void this.files.refresh(this.workspace.tree.root);
		this.palette.show(quickOpen(this));
	}

	reveal(document: Document) {
		if (document.path) return this.workspace.tree.reveal(document.path);
	}

	toggleWrap() {
		const wrap = !this.settings.value.wrap;
		this.settings.update({ wrap });
		this.workspace.editor.setWrap(wrap);
	}

	togglePreview() {
		this.settings.update({ preview: !this.settings.value.preview });
	}

	zoom(step: number) {
		const size = step === 0 ? DEFAULT_FONT_SIZE : this.settings.value.fontSize + step;
		this.settings.update({ fontSize: Math.min(FONT_SIZES.max, Math.max(FONT_SIZES.min, size)) });
	}

	refreshFromDisk() {
		return checkAll(this.workspace);
	}

	async quit() {
		const { workspace } = this;
		const unprotected = workspace.documents.filter((document) => document.dirty && !workspace.backups.preserves(document));
		if (!(await workspace.confirmClose(unprotected))) return;
		this.#persist.cancel();
		await workspace.backups.flush();
		await Promise.all([writeSession(workspace), this.settings.save()]);
		appWindow.close();
	}
}
