import { Text } from '@codemirror/state';
import type { Cursor } from '#lib/editor/editor.js';
import { detectIndentation } from '#lib/editor/indentation.js';
import { detectLanguage } from '#lib/editor/languages.js';
import { decode, type DecodedText } from './decode';
import { Document } from './document.svelte';
import type { Workspace } from './workspace.svelte';

const LARGE_CHARS = 10 * 1024 * 1024;

export interface OpenOptions {
	activate?: boolean;
	id?: string;
	cursor?: Cursor;
	top?: number;
	backup?: string | null;
}

const opening = new Map<string, Promise<Document | null>>();

function firstLine(text: string) {
	const end = text.indexOf('\n');
	return end < 0 ? text : text.slice(0, end);
}

function splitLines(text: string) {
	return Text.of(text.split(/\r\n?|\n/));
}

function defaults(workspace: Workspace) {
	const { tabs, tabWidth } = workspace.settings.value;
	return { tabs, width: tabWidth };
}

function prepare(workspace: Workspace, document: Document, text: string, cursor?: Cursor) {
	document.language = text.length > LARGE_CHARS ? null : detectLanguage(document.path, firstLine(text));
	document.indentation = detectIndentation(text, defaults(workspace));
	document.state = workspace.editor.createState(document, text, cursor);
	document.markSaved(document.state.doc);
	void workspace.editor.applyLanguage(document);
}

function describe(decoded: DecodedText, document: Document) {
	document.encoding = decoded.encoding;
	document.bom = decoded.bom;
	document.lineEnding = decoded.lineEnding;
}

async function readDocument(workspace: Workspace, path: string, options: OpenOptions) {
	const document = new Document(path, options.id);
	const [bytes, stat] = await Promise.all([workspace.backend.read(path), workspace.backend.stat(path)]);
	const decoded = await decode(bytes, path, workspace.backend);
	describe(decoded, document);
	document.stat = stat;
	const backup = options.backup ? await readBackup(workspace, options.backup) : null;
	prepare(workspace, document, backup ?? decoded.text, options.cursor);
	if (backup !== null) {
		document.markSaved(splitLines(decoded.text));
		document.dirty = !document.saved.eq(document.state.doc);
		document.backup = options.backup ?? null;
	}
	document.top = options.top ?? 0;
	return document;
}

async function readBackup(workspace: Workspace, name: string) {
	try {
		return new TextDecoder().decode(await workspace.backend.read(workspace.backups.path(name)));
	} catch {
		return null;
	}
}

export async function openPath(workspace: Workspace, path: string, options: OpenOptions = {}) {
	const existing = workspace.find(path);
	if (existing) {
		if (options.activate !== false) workspace.activate(existing);
		return existing;
	}
	const pending =
		opening.get(path) ??
		readDocument(workspace, path, options).catch((error) => {
			workspace.report(error);
			return null;
		});
	opening.set(path, pending);
	const document = await pending;
	opening.delete(path);
	if (document && !workspace.documents.includes(document)) workspace.add(document, options.activate ?? true);
	return document;
}

export function newDocument(workspace: Workspace, text = '', options: OpenOptions = {}) {
	const document = new Document(null, options.id);
	prepare(workspace, document, text, options.cursor);
	document.markSaved(Text.empty);
	document.dirty = text.length > 0;
	document.backup = options.backup ?? null;
	document.top = options.top ?? 0;
	workspace.add(document, options.activate ?? true);
	return document;
}

export async function restoreUntitled(workspace: Workspace, backup: string, options: OpenOptions) {
	const text = await readBackup(workspace, backup);
	return text === null ? null : newDocument(workspace, text, { ...options, backup });
}

export async function reload(workspace: Workspace, document: Document, encoding?: string) {
	if (!document.path) return;
	try {
		const [bytes, stat] = await Promise.all([workspace.backend.read(document.path), workspace.backend.stat(document.path)]);
		const decoded = await decode(bytes, document.path, workspace.backend, encoding);
		describe(decoded, document);
		document.stat = stat;
		document.markSaved(workspace.editor.replaceText(document, decoded.text));
		document.dirty = false;
		document.disk = 'current';
		await workspace.backups.remove(document);
	} catch (error) {
		workspace.report(error);
	}
}
