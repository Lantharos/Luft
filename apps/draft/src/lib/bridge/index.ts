import { app, events, fileUrl, invoke, listen } from '@lantharos/sabine';
import { activationToken, fileUrlPath } from '@luft/ui';
import type { Activation, AppState, Entry, FileIndex, SaveTarget, Stat, StoreName } from './types';

const CHOOSER = { timeoutMs: 24 * 60 * 60 * 1000 };

async function write(chunks: Iterable<string>, target: SaveTarget) {
	let id: number | null = null;
	try {
		for (const text of chunks) id = await invoke<number>('write_chunk', { id, text });
		id ??= await invoke<number>('write_chunk', { id, text: '' });
		return await invoke<Stat>('write_commit', { id, ...target });
	} catch (error) {
		if (id !== null) void invoke('write_discard', { id });
		throw error;
	}
}

export const backend = {
	appState: () => invoke<AppState>('app_state'),
	activationFolders: (activation: Activation) => invoke<string[]>('activation_folders', { ...activation }),
	readStore: <T>(name: StoreName) => invoke<T | null>('store_read', { name }),
	writeStore: (name: StoreName, value: unknown) => invoke<void>('store_write', { name, value }),
	removeBackup: (name: string) => invoke<void>('backup_remove', { name }),
	list: (path: string) => invoke<Entry[]>('dir_list', { path }),
	index: (path: string) => invoke<FileIndex>('dir_files', { path }, { timeoutMs: 5 * 60 * 1000 }),
	stat: (path: string) => invoke<Stat | null>('file_stat', { path }),
	detectEncoding: (path: string) => invoke<string>('file_encoding', { path }),
	read: async (path: string) => {
		const response = await fetch(fileUrl(path));
		if (!response.ok) throw new Error(`Couldn't read ${path}`);
		return new Uint8Array(await response.arrayBuffer());
	},
	write,
	watch: (paths: string[]) => invoke<void>('watch', { paths }),
	chooseFiles: (folder: string | null) => invoke<string[]>('choose_files', { folder }, CHOOSER),
	chooseFolder: (folder: string | null) => invoke<string | null>('choose_folder', { folder }, CHOOSER),
	chooseSave: (name: string, folder: string | null) => invoke<string | null>('choose_save', { name, folder }, CHOOSER),
	showInFolder: async (path: string) => invoke<void>('show_in_folder', { path, token: await activationToken() }),
	openLink: async (uri: string) => invoke<void>('open_link', { uri, token: await activationToken() }),
	takeOpenedFiles: async () => (await app.takeOpenUrls()).map(fileUrlPath).filter((path) => path !== null),
	onFilesOpened: (callback: () => void) => events.openUrlsAvailable(callback),
	onFilesChanged: (callback: (paths: string[]) => void) => listen<{ paths: string[] }>('draft.files', ({ paths }) => callback(paths)),
	onActivation: (callback: (activation: Activation) => void) => listen<Activation>('singleInstance.activate', callback)
};

export type Backend = typeof backend;
