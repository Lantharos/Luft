import { SAMPLE_FILES, SAMPLE_FOLDER, SAMPLE_HOME, sampleLog } from './sample-files';
import type { Backend, Entry, Stat } from './types';

const files = new Map(Object.entries(SAMPLE_FILES));
const modified = new Map<string, number>();
const parameters = new URLSearchParams(location.search);
const logSize = Number(parameters.get('log') ?? 0);
const launchFile = parameters.get('file');
if (logSize > 0) files.set(`${SAMPLE_FOLDER}/logs/tiles.log`, sampleLog(logSize));

const encoder = new TextEncoder();

function stat(path: string): Stat | null {
	const text = files.get(path);
	return text === undefined ? null : { size: text.length, modified: modified.get(path) ?? 0 };
}

function list(path: string): Entry[] {
	const prefix = `${path}/`;
	const children = new Map<string, Entry>();
	for (const file of files.keys()) {
		if (!file.startsWith(prefix)) continue;
		const [name, ...rest] = file.slice(prefix.length).split('/');
		children.set(name, { name, path: prefix + name, folder: rest.length > 0 });
	}
	return [...children.values()].sort((a, b) => Number(b.folder) - Number(a.folder) || a.name.localeCompare(b.name));
}

const idle = () => () => {};

export const sample: Backend = {
	appState: async () => ({ palette: null, typography: { interface: null, monospace: null, textScale: 1 }, home: SAMPLE_HOME, backups: '/tmp/draft', folders: launchFile ? [] : [SAMPLE_FOLDER] }),
	activationFolders: async () => [],
	readStore: async () => null,
	writeStore: async () => {},
	removeBackup: async () => {},
	list: async (path) => list(path),
	index: async (root) => ({ files: [...files.keys()].filter((file) => file.startsWith(`${root}/`)).map((file) => file.slice(root.length + 1)), truncated: false }),
	stat: async (path) => stat(path),
	detectEncoding: async () => 'windows-1252',
	read: async (path) => {
		const text = files.get(path);
		if (text === undefined) throw new Error(`Couldn't read ${path}`);
		return encoder.encode(text);
	},
	write: async (chunks, target) => {
		files.set(target.path, [...chunks].join(''));
		modified.set(target.path, Date.now());
		return stat(target.path)!;
	},
	watch: async () => {},
	chooseFiles: async () => [],
	chooseFolder: async () => null,
	chooseSave: async (name) => `${SAMPLE_FOLDER}/${name}`,
	showInFolder: async () => {},
	openLink: async (uri) => void window.open(uri, '_blank'),
	takeOpenedFiles: async () => (launchFile ? [`${SAMPLE_FOLDER}/${launchFile}`] : []),
	onFilesOpened: idle,
	onFilesChanged: idle,
	onActivation: idle
};
