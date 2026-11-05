import { app, fileUrl } from '@lantharos/sabine';
import { activationToken, fileUrlPath } from '@luft/ui';
import { commands } from '#lib/bindings.js';
import type { StoreName, Value } from '#lib/bindings.js';

export const CHOOSER = { timeoutMs: 24 * 60 * 60 * 1000 };

export interface SaveTarget {
	path: string;
	encoding: string;
	bom: boolean;
}

export async function readFile(path: string) {
	const response = await fetch(fileUrl(path));
	if (!response.ok) throw new Error(`Couldn't read ${path}`);
	return new Uint8Array(await response.arrayBuffer());
}

export async function writeFile(chunks: Iterable<string>, target: SaveTarget) {
	let id: number | null = null;
	try {
		for (const text of chunks) id = await commands.writeChunk({ id, text });
		id ??= await commands.writeChunk({ id, text: '' });
		return await commands.writeCommit({ id, ...target });
	} catch (error) {
		if (id !== null) void commands.writeDiscard({ id });
		throw error;
	}
}

export const readStore = <T>(name: StoreName) => commands.storeRead({ name }) as Promise<T | null>;
export const writeStore = (name: StoreName, value: unknown) => commands.storeWrite({ name, value: value as Value });
export const showInFolder = async (path: string) => commands.showInFolder({ path, token: await activationToken() });
export const openLink = async (uri: string) => commands.openLink({ uri, token: await activationToken() });
export const takeOpenedFiles = async () => (await app.takeOpenUrls()).map(fileUrlPath).filter((path) => path !== null);
