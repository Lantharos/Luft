import { app as sabineApp } from '@lantharos/sabine';
import { t } from '@luft/i18n';
import { appearance, errorText, fileUrlPath, Toasts } from '@luft/ui';
import { commands } from '#lib/bindings.js';
import { BoardDocument } from '#lib/board/board.svelte.js';
import { boardBounds } from '#lib/board/svg.js';
import { ImageDocument } from '#lib/document/image.svelte.js';
import { reshape } from '#lib/document/reshape.js';
import { Editor } from '#lib/editor/editor.svelte.js';
import { ToolSettings } from '#lib/editor/settings.svelte.js';
import { openBoard, saveBoard, type BoardRecord } from '#lib/files/board-file.js';
import { openImage, saveImage, type ImageRecord } from '#lib/files/image-file.svelte.js';
import { baseName, extension, pictureDocument } from '#lib/files/picture.js';
import { startGpu } from '#lib/gpu/device.js';
import { kit } from '#lib/gpu/kit.js';
import { scaling } from '#lib/gpu/matrix.js';
import { premultiplied } from '#lib/raster/color.js';
import { Whiteboard } from '#lib/whiteboard/whiteboard.svelte.js';
import { QuickEdit } from '#lib/quick/quick.svelte.js';
import { exportGrid, formatOf } from '#lib/files/export.js';
import { recent } from './recent.svelte';

export type Screen =
	| { kind: 'home' }
	| { kind: 'editor'; editor: Editor; path: string | null; name: string }
	| { kind: 'board'; whiteboard: Whiteboard; path: string | null; name: string }
	| { kind: 'quick'; quick: QuickEdit; path: string; name: string };

export type DialogKind = 'new-image' | 'export' | 'history' | 'resize' | 'unsaved' | 'save-back' | null;

const TOAST_MS = 2600;
const CHOOSER = { timeoutMs: 24 * 60 * 60 * 1000 };
const BOARD_FIT_MARGIN = 120;
const QUALITY = 92;

export class App {
	screen = $state<Screen>({ kind: 'home' });
	dialog = $state<DialogKind>(null);
	ready = $state(false);
	failure = $state<string | null>(null);
	pictures = $state<string | null>(null);
	busy = $state(false);
	readonly tools = new ToolSettings();
	readonly toasts = new Toasts(TOAST_MS);
	#leaving: ((choice: 'save' | 'discard' | 'cancel') => void) | null = null;

	async start() {
		const state = await commands.appState();
		appearance.start(state);
		this.pictures = state.pictures;
		try {
			await startGpu();
			kit.start();
		} catch (error) {
			this.failure = errorText(error);
			return;
		}
		await Promise.all([recent.load(), this.tools.load()]);
		this.ready = true;
		await this.openPaths(state.launchPaths);
	}

	async openPending() {
		const urls = await sabineApp.takeOpenUrls();
		await this.openPaths(urls.map(fileUrlPath).filter((path) => path !== null));
	}

	async openPaths(paths: string[], quick = true) {
		const [path] = paths;
		if (path && (await this.leave())) await this.open(path, quick);
	}

	get modified() {
		const screen = this.screen;
		if (screen.kind === 'editor') return screen.editor.doc.history.modified;
		if (screen.kind === 'board') return screen.whiteboard.board.history.modified;
		if (screen.kind === 'quick') return screen.quick.doc.history.modified || screen.quick.doc.adjust !== null;
		return false;
	}

	get name() {
		return this.screen.kind === 'home' ? '' : this.screen.name;
	}

	async chooseAndOpen() {
		const paths = await commands.chooseOpen({ folder: this.pictures }, CHOOSER);
		if (paths.length) await this.openPaths(paths, false);
	}

	async choosePictures() {
		return commands.chooseOpen({ folder: this.pictures }, CHOOSER);
	}

	async open(path: string, quick = false) {
		this.busy = true;
		try {
			if (extension(path) === 'easel') {
				const opened = await commands.openDocument({ path });
				const record = opened.document as unknown as ImageRecord | BoardRecord;
				if (record.kind === 'board') this.showBoard(await openBoard(record, opened.assets), path, baseName(path));
				else this.showImage(await openImage(record, opened.layers), path, baseName(path));
			} else if (quick) {
				this.showQuick(await pictureDocument(path), path);
			} else {
				this.showImage(await pictureDocument(path), null, baseName(path));
			}
			recent.touch(path);
			void sabineApp.addRecentDocument(path);
		} catch (error) {
			this.toasts.show(t('easel-open-failed', { reason: errorText(error) }));
		} finally {
			this.busy = false;
		}
	}

	async newImage(width: number, height: number, background: string | null) {
		if (!(await this.leave())) return;
		const doc = new ImageDocument(width, height);
		const layer = doc.newLayer('raster', background ? t('easel-layer-background') : t('easel-layer-name', { number: 1 }));
		doc.layers = [layer];
		doc.activeId = layer.id;
		if (background) {
			const params = new Float32Array(8);
			params.set(premultiplied(background));
			params[4] = 1;
			const uniform = kit.uniform(params);
			doc.paint('', layer, layer.pixels.all(), (_index, target) => kit.fill(target, kit.bake, [kit.clear, kit.full, kit.full, kit.clear, uniform]));
			doc.history.clear();
		}
		doc.invalidate();
		this.showImage(doc, null, t('easel-untitled'));
	}

	async newBoard() {
		if (!(await this.leave())) return;
		this.showBoard(new BoardDocument(), null, t('easel-untitled-board'));
	}

	showImage(doc: ImageDocument, path: string | null, name: string) {
		this.#closeScreen();
		const editor = new Editor(doc, this.tools);
		this.screen = { kind: 'editor', editor, path, name };
		editor.viewport.whenSized(() => editor.viewport.fit(doc.width, doc.height));
	}

	showQuick(doc: ImageDocument, path: string) {
		this.#closeScreen();
		const quick = new QuickEdit(doc);
		this.screen = { kind: 'quick', quick, path, name: path.split('/').pop()! };
		quick.viewport.whenSized(() => quick.viewport.fit(doc.width, doc.height));
	}

	openQuickInEditor() {
		if (this.screen.kind !== 'quick') return;
		const { quick, name } = this.screen;
		quick.bake();
		const editor = new Editor(quick.doc, this.tools);
		this.screen = { kind: 'editor', editor, path: null, name: baseName(name) };
		editor.viewport.whenSized(() => editor.viewport.fit(quick.doc.width, quick.doc.height));
	}

	async finishQuick() {
		if (this.screen.kind !== 'quick') return;
		this.dialog = 'save-back';
	}

	async saveBack(choice: 'replace' | 'copy' | 'cancel') {
		this.dialog = null;
		const screen = this.screen;
		if (screen.kind !== 'quick' || choice === 'cancel') return false;
		const original = formatOf(screen.path);
		let path: string | null = screen.path;
		if (choice === 'copy' || !original) {
			const extension = original ? screen.path.split('.').pop() : 'png';
			path = await commands.chooseSave({ name: `${baseName(screen.path)} ${t('easel-edited')}.${extension}`, folder: screen.path.slice(0, screen.path.lastIndexOf('/')) }, CHOOSER);
		}
		if (!path) return false;
		const { doc } = screen.quick;
		screen.quick.text.commit();
		screen.quick.applyCrop();
		this.busy = true;
		try {
			doc.scene([1, 0, 0, 1, 0, 0]);
			await exportGrid(doc.compositor.levels[0], { path, format: formatOf(path) ?? 'png', quality: QUALITY, width: doc.width, height: doc.height });
			doc.history.markSaved();
			doc.adjust = null;
			await sabineApp.quit();
			return true;
		} catch (error) {
			this.toasts.show(t('easel-save-failed', { reason: errorText(error) }));
			return false;
		} finally {
			this.busy = false;
		}
	}

	showBoard(board: BoardDocument, path: string | null, name: string) {
		this.#closeScreen();
		const whiteboard = new Whiteboard(board);
		this.screen = { kind: 'board', whiteboard, path, name };
		whiteboard.viewport.whenSized(() => this.fitBoard());
	}

	fitBoard() {
		if (this.screen.kind !== 'board') return;
		const { board, viewport } = this.screen.whiteboard;
		if (!board.objects.length) return viewport.centerOn(0, 0);
		const area = boardBounds(board.objects, board.lookup, BOARD_FIT_MARGIN);
		viewport.scale = Math.min(1, viewport.width / area.w, viewport.height / area.h);
		viewport.centerOn(area.x + area.w / 2, area.y + area.h / 2);
	}

	resize(width: number, height: number) {
		if (this.screen.kind !== 'editor') return;
		const { doc, viewport } = this.screen.editor;
		this.screen.editor.finishTool();
		reshape(doc, t('easel-history-resize'), width, height, scaling(width / doc.width, height / doc.height));
		viewport.fit(width, height);
	}

	async save(as = false) {
		const screen = this.screen;
		if (screen.kind === 'home') return false;
		if (screen.kind === 'quick') {
			this.dialog = 'save-back';
			return false;
		}
		let path = screen.path;
		if (as || !path) {
			path = await commands.chooseSave({ name: `${screen.name}.easel`, folder: this.pictures }, CHOOSER);
			if (!path) return false;
			if (!path.endsWith('.easel')) path += '.easel';
		}
		this.busy = true;
		try {
			if (screen.kind === 'editor') {
				screen.editor.finishTool();
				await saveImage(screen.editor.doc, path);
			} else {
				screen.whiteboard.finishEditing(null);
				await saveBoard(screen.whiteboard.board, path);
			}
			screen.path = path;
			screen.name = baseName(path);
			recent.touch(path);
			return true;
		} catch (error) {
			this.toasts.show(t('easel-save-failed', { reason: errorText(error) }));
			return false;
		} finally {
			this.busy = false;
		}
	}

	async leave() {
		if (!this.modified) return true;
		this.dialog = 'unsaved';
		const choice = await new Promise<'save' | 'discard' | 'cancel'>((resolve) => (this.#leaving = resolve));
		this.dialog = null;
		if (choice === 'save') return this.save();
		return choice === 'discard';
	}

	answerLeave(choice: 'save' | 'discard' | 'cancel') {
		this.#leaving?.(choice);
		this.#leaving = null;
	}

	async close() {
		if (this.screen.kind === 'home') return sabineApp.quit();
		if (!(await this.leave())) return;
		this.#closeScreen();
	}

	#closeScreen() {
		if (this.screen.kind === 'editor') this.screen.editor.doc.destroy();
		if (this.screen.kind === 'board') this.screen.whiteboard.board.destroy();
		if (this.screen.kind === 'quick') this.screen.quick.doc.destroy();
		this.screen = { kind: 'home' };
	}
}
