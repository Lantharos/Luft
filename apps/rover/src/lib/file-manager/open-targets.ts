import * as api from '$lib/api';
import { selection } from '$lib/stores';
import { getParentPath } from '$lib/utils';

export type SingleInstanceActivation = {
	policy: string;
	arguments: string[];
	workingDirectory?: string | null;
};

type OpenFolder = (folder: string, replaceActive: boolean) => Promise<void>;

export async function openExternalTargets(paths: string[], replaceActive: boolean, openFolder: OpenFolder) {
	let replaceNext = replaceActive;
	for (const path of paths) {
		const target = await resolveOpenTarget(path);
		await openFolder(target.folder, replaceNext);
		replaceNext = false;
		if (target.selectPath) selection.select(target.selectPath);
	}
}

export function pathsFromActivation(activation: SingleInstanceActivation) {
	return pathsFromArguments(activation.arguments, activation.workingDirectory ?? null);
}

export function pathsFromArguments(args: string[], workingDirectory?: string | null) {
	const paths = args
		.slice(1)
		.map((arg) => pathFromArgument(arg, workingDirectory))
		.filter((path): path is string => Boolean(path));
	return [...new Set(paths)];
}

function pathFromArgument(arg: string, workingDirectory?: string | null) {
	const trimmed = arg.trim();
	if (!trimmed || trimmed.startsWith('--')) return null;
	const filePath = fileUrlPath(trimmed);
	if (filePath) return normalizeAbsolutePath(filePath);
	if (trimmed.startsWith('/')) return normalizeAbsolutePath(decodePath(trimmed));
	if (!workingDirectory) return null;
	return normalizeAbsolutePath(`${workingDirectory.replace(/\/+$/, '')}/${decodePath(trimmed)}`);
}

function fileUrlPath(value: string) {
	if (value.startsWith('file://localhost/')) return decodePath(value.slice('file://localhost'.length));
	if (value.startsWith('file:///')) return decodePath(value.slice('file://'.length));
	return null;
}

function decodePath(path: string) {
	try {
		return decodeURIComponent(path);
	} catch {
		return path;
	}
}

function normalizeAbsolutePath(path: string) {
	const parts: string[] = [];
	for (const segment of path.split('/')) {
		if (!segment || segment === '.') continue;
		if (segment === '..') parts.pop();
		else parts.push(segment);
	}
	return `/${parts.join('/')}`;
}

async function resolveOpenTarget(path: string): Promise<{ folder: string; selectPath: string | null }> {
	try {
		const entry = await api.getFileInfo(path);
		if (entry.is_dir) return { folder: entry.path, selectPath: null };
		return { folder: getParentPath(entry.path), selectPath: entry.path };
	} catch {
		return { folder: path, selectPath: null };
	}
}
