import { commands, events, type FileAction, type FileEntry } from '#lib/bindings.js';

function takesType(action: FileAction, entry: FileEntry): boolean {
	if (!action.types.length && !action.extensions.length) return true;
	const type = entry.mimeType ?? '';
	const group = `${type.slice(0, type.indexOf('/'))}/*`;
	const extension = entry.extension?.toLowerCase() ?? '';
	return action.types.some((wanted) => wanted === type || wanted === group) || action.extensions.some((wanted) => wanted.toLowerCase() === extension);
}

function takes(action: FileAction, entry: FileEntry): boolean {
	if (entry.isDir) return action.kind !== 'files';
	return action.kind !== 'folders' && takesType(action, entry);
}

/** What extensions add to the menu of files and folders, kept as Kestrel last described it so the menu opens without waiting. */
export class FileActionsState {
	actions = $state.raw<FileAction[]>([]);

	load = async () => {
		void events.roverFileActions((actions) => (this.actions = actions));
		this.actions = await commands.fileActions().catch(() => []);
	};

	for = (targets: FileEntry[]) =>
		targets.length ? this.actions.filter((action) => (action.multiple || targets.length === 1) && targets.every((entry) => takes(action, entry))) : [];

	opened = (id: string) => void commands.fileActionOpened({ id }).catch(() => {});

	run = (id: string, paths: string[], choice: string | null = null) => commands.runFileAction({ id, choice, paths });
}
