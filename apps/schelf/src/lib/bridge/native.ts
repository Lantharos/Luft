import { invoke, listen } from '@lantharos/sabine';
import type { Backend } from './types';

const SLOW = { timeoutMs: 300_000 };

export const native: Backend = {
	appState: () => invoke('app_state'),
	activationFiles: (argumentsList, workingDirectory) => invoke('app_activation_files', { arguments: argumentsList, workingDirectory }),
	flathub: (path) => invoke('flathub_get', { path }),
	flathubSearch: (query) => invoke('flathub_search', { query }),
	fedoraApps: () => invoke('fedora_apps'),
	fedoraApp: (id) => invoke('fedora_app', { id }),
	installed: () => invoke('library_installed'),
	launch: (desktop) => invoke('library_launch', { desktop }),
	removalPlan: (packageName) => invoke('library_removal_plan', { package: packageName }),
	permissions: (installation, reference) => invoke('library_permissions', { installation, reference }),
	checkUpdates: () => invoke('updates_check', {}, SLOW),
	inspectFile: (path) => invoke('files_inspect', { path }),
	chooseAppImage: () => invoke('files_choose_appimage', {}, SLOW),
	operations: () => invoke('operations_list'),
	start: (key, title, job, members = []) => invoke('operations_start', { key, title, job, members }),
	cancel: (id) => invoke('operations_cancel', { id }),
	openUrl: (url) => invoke('app_open_url', { url }),
	onOperations: (callback) => listen('schelf.operations', callback),
	onLibraryChanged: (callback) => listen('schelf.library', callback),
	onActivated: (callback) => listen('singleInstance.activate', callback)
};
