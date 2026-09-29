import type { Cursor } from '$lib/editor/editor';
import { debounce } from '$lib/utils/debounce';
import { openPath, restoreUntitled, type OpenOptions } from './opening';
import type { Workspace } from './workspace.svelte';

interface SessionDocument {
	id: string;
	path: string | null;
	cursor: Cursor;
	top: number;
	backup: string | null;
}

export interface Session {
	folder: string | null;
	expanded: string[];
	documents: SessionDocument[];
	active: string | null;
}

const SAVE_DELAY_MS = 800;

function snapshot(workspace: Workspace): Session {
	const shown = workspace.editor.shown;
	return {
		folder: workspace.tree.root,
		expanded: [...workspace.tree.expanded],
		documents: workspace.documents.map((document) => ({
			id: document.id,
			path: document.path,
			cursor: workspace.editor.cursor(document),
			top: document === shown ? workspace.editor.topPosition() : document.top,
			backup: document.backup
		})),
		active: workspace.active?.id ?? null
	};
}

export function sessionName(browsing: boolean) {
	return browsing ? 'session' : 'files';
}

export function writeSession(workspace: Workspace) {
	return workspace.backend.writeStore(sessionName(workspace.browsing), snapshot(workspace));
}

export function sessionWriter(workspace: Workspace) {
	return debounce(() => void writeSession(workspace), SAVE_DELAY_MS);
}

async function restoreDocument(workspace: Workspace, saved: SessionDocument) {
	const options: OpenOptions = { activate: false, id: saved.id, cursor: saved.cursor, top: saved.top, backup: saved.backup };
	if (saved.path) {
		const document = await openPath(workspace, saved.path, options);
		if (document || !saved.backup) return document;
	}
	return saved.backup ? restoreUntitled(workspace, saved.backup, options) : null;
}

async function restoreDocuments(workspace: Workspace, session: Session) {
	const active = session.documents.find((document) => document.id === session.active);
	if (active) {
		const document = await restoreDocument(workspace, active);
		if (document) workspace.activate(document, false);
	}
	await Promise.all(session.documents.filter((document) => document !== active).map((document) => restoreDocument(workspace, document)));
	const order = new Map(session.documents.map((document, index) => [document.id, index]));
	workspace.documents.sort((a, b) => (order.get(a.id) ?? Infinity) - (order.get(b.id) ?? Infinity));
	if (!workspace.active && workspace.documents.length) workspace.activate(workspace.documents[0], false);
}

export async function restoreSession(workspace: Workspace, session: Session | null, folder: string | null) {
	const root = folder ?? session?.folder ?? null;
	const tree = root ? workspace.showFolder(root, root === session?.folder ? session.expanded : []) : null;
	if (session) await restoreDocuments(workspace, session);
	await tree;
}
