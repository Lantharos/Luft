import { bytes, plural } from '@luft/ui';
import * as api from '#lib/api.js';
import type { FileManager } from '#lib/file-manager/manager.svelte.js';
import type { CloudDrive } from '#lib/types/cloud.js';
import type { FileEntry } from '#lib/types/index.js';
import { history } from './history.svelte';

const paths = (entries: FileEntry[]) => entries.map((entry) => entry.path);

export function keptEverywhere(manager: FileManager, entries: FileEntry[]) {
	return entries.length > 0 && entries.every((entry) => manager.cloud.stateOf(entry.path) === 'local');
}

export async function keep(manager: FileManager, entries: FileEntry[]) {
	await api.keepOnDevice(paths(entries)).catch(manager.notify);
}

export async function free(manager: FileManager, entries: FileEntry[]) {
	history.inform('Sending changes up before freeing space…');
	try {
		await api.freeUpSpace(paths(entries));
		history.inform(entries.length === 1 ? `${entries[0].name} is online only now` : 'Freed up space');
	} catch (caught) {
		history.dismiss();
		manager.notify(caught);
	}
}

export async function copyShareLink(manager: FileManager, entry: FileEntry) {
	try {
		const link = await api.shareLink(entry.path);
		await navigator.clipboard.writeText(link);
		history.inform('Share link copied');
	} catch (caught) {
		manager.notify(caught);
	}
}

export async function openInBrowser(manager: FileManager, entry: FileEntry) {
	await api.openInBrowser(entry.path).catch(manager.notify);
}

export function describe(drive: CloudDrive) {
	if (drive.state === 'signInAgain') return 'Sign in again in Settings';
	if (drive.state === 'offline') return drive.kept.length ? 'Offline, showing what’s kept on this device' : 'Offline';
	if (drive.state === 'connecting') return 'Connecting…';
	if (drive.state === 'problem') return drive.problem ?? 'Not connected';
	if (drive.paused) return drive.paused === 'metered' ? 'Syncing paused on a metered connection' : 'Syncing paused while the battery is low';
	if (drive.syncing > 0) return `Syncing ${plural(drive.syncing, 'change')}`;
	return drive.usage ? `${bytes(drive.usage.used)} of ${bytes(drive.usage.total)} used` : null;
}
