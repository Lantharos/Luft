import { detectLanguage } from '$lib/editor/languages';
import { basename, dirname } from '$lib/utils/paths';
import { textChunks } from './chunks';
import type { Document } from './document.svelte';
import { LINE_BREAKS } from './encodings';
import type { Workspace } from './workspace.svelte';

async function write(workspace: Workspace, document: Document, path: string) {
	const text = workspace.editor.state(document).doc;
	document.saving = true;
	try {
		document.stat = await workspace.backend.write(textChunks(text, LINE_BREAKS[document.lineEnding]), {
			path,
			encoding: document.encoding,
			bom: document.bom
		});
	} catch (error) {
		workspace.report(error);
		return false;
	} finally {
		document.saving = false;
	}
	const renamed = document.path !== path;
	document.path = path;
	document.markSaved(text);
	workspace.refreshDirty(document);
	document.disk = 'current';
	workspace.notice = null;
	if (!document.dirty) await workspace.backups.remove(document);
	if (renamed) {
		document.language = detectLanguage(path, text.line(1).text);
		void workspace.editor.applyLanguage(document);
	}
	workspace.changed();
	return true;
}

export async function saveAs(workspace: Workspace, document: Document) {
	const folder = document.path ? dirname(document.path) : workspace.tree.root;
	const path = await workspace.backend.chooseSave(document.path ? basename(document.path) : `${document.name}.txt`, folder).catch((error) => {
		workspace.report(error);
		return null;
	});
	if (!path) return false;
	const other = workspace.find(path);
	if (other && other !== document) workspace.remove(other);
	return write(workspace, document, path);
}

export function save(workspace: Workspace, document: Document) {
	return document.path ? write(workspace, document, document.path) : saveAs(workspace, document);
}

export async function saveAll(workspace: Workspace) {
	for (const document of workspace.documents) if (document.dirty && !(await save(workspace, document))) return false;
	return true;
}
