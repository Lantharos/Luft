import { app, events, fileUrl, invoke, listen } from '@lantharos/sabine';
import { fileUrlPath } from '@luft/ui';
import type { Activation, AppState, Backend, Entry, FileIndex, SaveTarget, Stat, StoreName } from './types';

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

export const native: Backend = {
	appState: () => invoke<AppState>('app_state'),
	activationFolders: (activation) => invoke<string[]>('activation_folders', { ...activation }),
	readStore: <T>(name: StoreName) => invoke<T | null>('store_read', { name }),
	writeStore: (name, value) => invoke('store_write', { name, value }),
	removeBackup: (name) => invoke('backup_remove', { name }),
	list: (path) => invoke<Entry[]>('dir_list', { path }),
	index: (path) => invoke<FileIndex>('dir_files', { path }, { timeoutMs: 5 * 60 * 1000 }),
	stat: (path) => invoke<Stat | null>('file_stat', { path }),
	detectEncoding: (path) => invoke<string>('file_encoding', { path }),
	read: async (path) => {
		const response = await fetch(fileUrl(path));
		if (!response.ok) throw new Error(`Couldn't read ${path}`);
		return new Uint8Array(await response.arrayBuffer());
	},
	write,
	watch: (paths) => invoke('watch', { paths }),
	chooseFiles: (folder) => invoke<string[]>('choose_files', { folder }, CHOOSER),
	chooseFolder: (folder) => invoke<string | null>('choose_folder', { folder }, CHOOSER),
	chooseSave: (name, folder) => invoke<string | null>('choose_save', { name, folder }, CHOOSER),
	showInFolder: (path) => invoke('show_in_folder', { path }),
	openLink: (uri) => invoke('open_link', { uri }),
	takeOpenedFiles: async () => (await app.takeOpenUrls()).map(fileUrlPath).filter((path) => path !== null),
	onFilesOpened: (callback) => events.openUrlsAvailable(callback),
	onFilesChanged: (callback) => listen<{ paths: string[] }>('draft.files', ({ paths }) => callback(paths)),
	onActivation: (callback) => listen<Activation>('singleInstance.activate', callback)
};
