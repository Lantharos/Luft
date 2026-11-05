import { commands, type Details, type Edits, type FileEntry, type Mark, type Preview, type Rect } from '#lib/bindings.js';
import { noEdits } from './defaults';
import { session } from './session.svelte';

export type Tool = 'move' | 'crop' | 'arrow' | 'line' | 'box' | 'ellipse' | 'highlight' | 'text' | 'blur' | 'redact';

const PROXY_EDGE = 1800;
const HISTORY_LIMIT = 100;

export const SCRUB_DELAY = 60;

function turnedPoint(point: { x: number; y: number }, height: number) {
	return { x: height - point.y, y: point.x };
}

function turnedArea(area: Rect, height: number): Rect {
	return { x: height - area.y - area.height, y: area.x, width: area.height, height: area.width };
}

function mirroredArea(area: Rect, width: number): Rect {
	return { ...area, x: width - area.x - area.width };
}

function turnedMark(mark: Mark, height: number): Mark {
	if ('area' in mark) return { ...mark, area: turnedArea(mark.area, height) };
	if ('from' in mark) return { ...mark, from: turnedPoint(mark.from, height), to: turnedPoint(mark.to, height) };
	return { ...mark, at: turnedPoint(mark.at, height) };
}

function mirroredMark(mark: Mark, width: number): Mark {
	const flip = (point: { x: number; y: number }) => ({ x: width - point.x, y: point.y });
	if ('area' in mark) return { ...mark, area: mirroredArea(mark.area, width) };
	if ('from' in mark) return { ...mark, from: flip(mark.from), to: flip(mark.to) };
	return { ...mark, at: flip(mark.at) };
}

class Editor {
	file = $state.raw<FileEntry | null>(null);
	details = $state.raw<Details | null>(null);
	preview = $state.raw<Preview | null>(null);
	peaks = $state.raw<number[]>([]);
	edits = $state<Edits>(noEdits());
	tool = $state<Tool>('move');
	color = $state('#e5484d');
	selectedMark = $state<number | null>(null);
	time = $state(0);
	failed = $state<string | null>(null);
	#past = $state.raw<string[]>([]);
	#future = $state.raw<string[]>([]);
	#request = 0;

	canUndo = $derived(this.#past.length > 0);
	canRedo = $derived(this.#future.length > 0);
	sourceWidth = $derived(this.details?.width ?? this.preview?.width ?? 0);
	sourceHeight = $derived(this.details?.height ?? this.preview?.height ?? 0);
	quarterTurned = $derived(this.edits.rotate % 180 !== 0);
	width = $derived(this.quarterTurned ? this.sourceHeight : this.sourceWidth);
	height = $derived(this.quarterTurned ? this.sourceWidth : this.sourceHeight);
	duration = $derived(this.details?.media?.duration ?? 0);
	visual = $derived(this.file?.family === 'image' || this.file?.family === 'video');
	previewable = $derived(this.visual || this.file?.format === 'pdf');
	timed = $derived(this.file?.family === 'video' || this.file?.family === 'audio');

	async open(file: FileEntry) {
		if (this.file?.path === file.path) return;
		this.#store();
		const request = ++this.#request;
		this.file = file;
		this.details = null;
		this.preview = null;
		this.peaks = [];
		this.failed = null;
		this.time = 0;
		this.selectedMark = null;
		this.tool = 'move';
		this.edits = structuredClone($state.snapshot(session.editsFor(file.path)) as Edits);
		this.#past = [];
		this.#future = [];
		try {
			const details = await commands.fileDetails({ path: file.path });
			if (request !== this.#request) return;
			this.details = details;
			if (this.previewable) await this.loadFrame(0);
			if (this.timed && details.media?.audio.length) void this.#loadPeaks(file.path, details.media.duration, request);
		} catch (error) {
			if (request === this.#request) this.failed = String(error);
		}
	}

	async #loadPeaks(path: string, duration: number, request: number) {
		const peaks = await commands.peaks({ path, duration, buckets: 480 }).catch(() => []);
		if (request === this.#request) this.peaks = peaks;
	}

	async loadFrame(time: number) {
		const file = this.file;
		if (!file) return;
		const request = this.#request;
		try {
			const preview = await commands.proxy({ path: file.path, edge: PROXY_EDGE, time });
			if (request === this.#request) this.preview = preview;
		} catch (error) {
			if (request === this.#request && !this.preview) this.failed = String(error);
		}
	}

	#store() {
		if (this.file) session.edits.set(this.file.path, $state.snapshot(this.edits) as Edits);
	}

	commit(previous: string) {
		if (previous === JSON.stringify(this.edits)) return;
		this.#past = [...this.#past.slice(-HISTORY_LIMIT + 1), previous];
		this.#future = [];
		this.#store();
	}

	change(apply: (edits: Edits) => void) {
		const previous = JSON.stringify(this.edits);
		apply(this.edits);
		this.commit(previous);
	}

	undo() {
		const previous = this.#past.at(-1);
		if (previous === undefined) return;
		this.#future = [JSON.stringify(this.edits), ...this.#future];
		this.#past = this.#past.slice(0, -1);
		this.edits = JSON.parse(previous);
		this.selectedMark = null;
		this.#store();
	}

	redo() {
		const [next, ...rest] = this.#future;
		if (next === undefined) return;
		this.#past = [...this.#past, JSON.stringify(this.edits)];
		this.#future = rest;
		this.edits = JSON.parse(next);
		this.selectedMark = null;
		this.#store();
	}

	reset() {
		this.change((edits) => Object.assign(edits, noEdits()));
		this.selectedMark = null;
	}

	rotate() {
		const height = this.height;
		this.change((edits) => {
			const mirrored = edits.flipHorizontal;
			edits.rotate = (edits.rotate + (mirrored ? 270 : 90)) % 360;
			edits.marks = edits.marks.map((mark) => turnedMark(mark, height));
			edits.crop = edits.crop && turnedArea(edits.crop, height);
		});
	}

	flipHorizontal() {
		const width = this.width;
		this.change((edits) => {
			edits.flipHorizontal = !edits.flipHorizontal;
			edits.marks = edits.marks.map((mark) => mirroredMark(mark, width));
			edits.crop = edits.crop && mirroredArea(edits.crop, width);
		});
	}

	flipVertical() {
		const { width, height } = this;
		this.change((edits) => {
			edits.flipHorizontal = !edits.flipHorizontal;
			edits.rotate = (edits.rotate + 180) % 360;
			const turn = (mark: Mark) => turnedMark(turnedMark(mark, height), width);
			edits.marks = edits.marks.map((mark) => mirroredMark(turn(mark), width));
			edits.crop = edits.crop && mirroredArea(turnedArea(turnedArea(edits.crop, height), width), width);
		});
	}

	removeSelected() {
		const index = this.selectedMark;
		if (index === null) return;
		this.change((edits) => void edits.marks.splice(index, 1));
		this.selectedMark = null;
	}
}

export const editor = new Editor();
