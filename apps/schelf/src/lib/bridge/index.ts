import { invoke, listen } from '@lantharos/sabine';
import { activationToken } from '@luft/ui';
import type { Backend } from './types';

const SLOW = { timeoutMs: 300_000 };

export const backend: Backend = {
	appState: () => invoke('app_state'),
	activationFiles: (argumentsList, workingDirectory) => invoke('app_activation_files', { arguments: argumentsList, workingDirectory }),
	flathub: (path) => invoke('flathub_get', { path }),
	flathubSearch: (query) => invoke('flathub_search', { query }),
	installed: () => invoke('library_installed'),
	launch: async (desktop) => invoke('library_launch', { desktop, token: await activationToken() }),
	searchTools: (query) => invoke('tools_search', { query }, SLOW),
	searchSystem: (query) => invoke('system_search', { query }, SLOW),
	sources: () => invoke('sources_list'),
	fetchSource: (source) => invoke('sources_fetch', { source }, SLOW),
	addSource: (draft) => invoke('sources_add', { draft }, SLOW),
	permissions: (installation, reference) => invoke('library_permissions', { installation, reference }),
	fullAccess: (id, source) => invoke('library_full_access', { id, source }),
	setFullAccess: (id, source, on) => invoke('library_set_full_access', { id, source, on }, SLOW),
	checkUpdates: () => invoke('updates_check', {}, SLOW),
	inspectFile: (path) => invoke('files_inspect', { path }),
	chooseAppImage: () => invoke('files_choose_appimage', {}, SLOW),
	operations: () => invoke('operations_list'),
	start: (key, title, job, members = []) => invoke('operations_start', { key, title, job, members }),
	cancel: (id) => invoke('operations_cancel', { id }),
	openUrl: async (url) => invoke('app_open_url', { url, token: await activationToken() }),
	onOperations: (callback) => listen('schelf.operations', callback),
	onLibraryChanged: (callback) => listen('schelf.library', callback),
	onActivated: (callback) => listen('singleInstance.activate', callback)
};
