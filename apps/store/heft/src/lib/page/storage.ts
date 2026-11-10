import { appendFile, readFile, replaceFile, WriteQueue } from '#lib/bridge/files.js';
import { crc32, readStroke, strokeSize, writeStroke } from '#lib/ink/codec.js';
import type { Stroke } from '#lib/ink/stroke.js';
import { PageDocument, type Change } from './document';

const MAGIC = 0x54464548;
const FORMAT = 1;
const OP_REPLACE = 1;
const OP_OBJECTS = 2;
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const COMPACT_AFTER = 256 * 1024;

function encodeObjects(change: Change): Uint8Array {
	const objects = change.objects!;
	const json = encoder.encode(
		JSON.stringify({
			put: objects.flatMap(({ after }) => (after ? [after] : [])),
			drop: objects.flatMap(({ before, after }) => (after ? [] : [before!.id]))
		})
	);
	const bytes = new Uint8Array(9 + json.length);
	const view = new DataView(bytes.buffer);
	view.setUint32(0, json.length + 1, true);
	view.setUint8(8, OP_OBJECTS);
	bytes.set(json, 9);
	view.setUint32(4, crc32(bytes.subarray(8)), true);
	return bytes;
}

function encodeStrokes(change: Change): Uint8Array {
	const size = 8 + 1 + 4 + change.removed.length * 8 + 4 + change.added.reduce((total, stroke) => total + strokeSize(stroke), 0);
	const bytes = new Uint8Array(size);
	const view = new DataView(bytes.buffer);
	view.setUint32(0, size - 8, true);
	view.setUint8(8, OP_REPLACE);
	let at = 9;
	view.setUint32(at, change.removed.length, true);
	at += 4;
	for (const stroke of change.removed) {
		view.setFloat64(at, Number.parseInt(stroke.id, 36), true);
		at += 8;
	}
	view.setUint32(at, change.added.length, true);
	at += 4;
	for (const stroke of change.added) at = writeStroke(view, at, stroke);
	view.setUint32(4, crc32(bytes.subarray(8)), true);
	return bytes;
}

function replayJournal(document: PageDocument, bytes: Uint8Array) {
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	let at = 0;
	while (at + 9 <= bytes.length) {
		const length = view.getUint32(at, true);
		const end = at + 8 + length;
		if (end > bytes.length || crc32(bytes.subarray(at + 8, end)) !== view.getUint32(at + 4, true)) break;
		if (view.getUint8(at + 8) === OP_REPLACE) {
			let cursor = at + 9;
			const removed: string[] = [];
			for (let count = view.getUint32(cursor, true), index = 0; index < count; index++) {
				removed.push(view.getFloat64(cursor + 4 + index * 8, true).toString(36));
			}
			cursor += 4 + removed.length * 8;
			const added: Stroke[] = [];
			const count = view.getUint32(cursor, true);
			cursor += 4;
			for (let index = 0; index < count; index++) {
				const [stroke, next] = readStroke(view, cursor);
				added.push(stroke);
				cursor = next;
			}
			document.replay(removed, added);
		} else if (view.getUint8(at + 8) === OP_OBJECTS) {
			const { put, drop } = JSON.parse(decoder.decode(bytes.subarray(at + 9, end)));
			document.replayObjects(put, drop);
		}
		at = end;
	}
}

function encodePage(document: PageDocument): Uint8Array {
	const objects = encoder.encode(JSON.stringify(document.objects));
	const size = 16 + document.strokes.reduce((total, stroke) => total + strokeSize(stroke), 0) + objects.length;
	const bytes = new Uint8Array(size);
	const view = new DataView(bytes.buffer);
	view.setUint32(0, MAGIC, true);
	view.setUint16(4, FORMAT, true);
	view.setUint32(8, document.strokes.length, true);
	let at = 12;
	for (const stroke of document.strokes) at = writeStroke(view, at, stroke);
	view.setUint32(at, objects.length, true);
	bytes.set(objects, at + 4);
	return bytes;
}

function readPage(document: PageDocument, bytes: Uint8Array) {
	if (bytes.length < 12) return;
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	if (view.getUint32(0, true) !== MAGIC) throw new Error('This page was not written by Heft');
	if (view.getUint16(4, true) > FORMAT) throw new Error('This page was written by a newer Heft');
	const strokes: Stroke[] = [];
	let at = 12;
	for (let count = view.getUint32(8, true), index = 0; index < count; index++) {
		const [stroke, next] = readStroke(view, at);
		strokes.push(stroke);
		at = next;
	}
	document.replay([], strokes);
	if (at + 4 <= bytes.length) document.replayObjects(JSON.parse(decoder.decode(bytes.subarray(at + 4, at + 4 + view.getUint32(at, true)))), []);
}

export class PageStore {
	readonly document: PageDocument;
	private readonly queue = new WriteQueue();
	private journalSize = 0;
	private compactedRevision = 0;

	private constructor(
		private readonly folder: () => string,
		readonly id: string
	) {
		this.document = new PageDocument((change) => this.append(change));
	}

	private get base() {
		return `${this.folder()}/pages/${this.id}`;
	}

	static async open(folder: () => string, pageId: string): Promise<PageStore> {
		const store = new PageStore(folder, pageId);
		const [page, journal] = await Promise.all([readFile(`${store.base}.page`), readFile(`${store.base}.journal`)]);
		readPage(store.document, page);
		replayJournal(store.document, journal);
		store.journalSize = journal.length;
		store.compactedRevision = journal.length ? -1 : store.document.revision;
		return store;
	}

	get settled() {
		return this.queue.settled;
	}

	private append(change: Change) {
		const records = [...(change.removed.length || change.added.length ? [encodeStrokes(change)] : []), ...(change.objects?.length ? [encodeObjects(change)] : [])];
		const record = new Uint8Array(records.reduce((total, part) => total + part.length, 0));
		records.reduce((at, part) => (record.set(part, at), at + part.length), 0);
		this.journalSize += record.length;
		void this.queue.run(() => appendFile(`${this.base}.journal`, record));
		if (this.journalSize > COMPACT_AFTER) this.compact();
	}

	compact(always = false) {
		if (!always && this.compactedRevision === this.document.revision) return this.queue.settled;
		const bytes = encodePage(this.document);
		this.compactedRevision = this.document.revision;
		this.journalSize = 0;
		return this.queue.run(async () => {
			await replaceFile(`${this.base}.page`, bytes);
			await replaceFile(`${this.base}.journal`, new Uint8Array());
		});
	}
}
