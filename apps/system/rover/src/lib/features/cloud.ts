import { t } from '@luft/i18n';
import { bytes } from '@luft/ui';
import { commands } from '#lib/bindings.js';
import type { Drive, FileEntry } from '#lib/bindings.js';
import * as api from '#lib/bridge/index.js';
import type { FileManager } from '#lib/file-manager/manager.svelte.js';
import { history } from './history.svelte';

const paths = (entries: FileEntry[]) => entries.map((entry) => entry.path);

export function keptEverywhere(manager: FileManager, entries: FileEntry[]) {
	return entries.length > 0 && entries.every((entry) => manager.cloud.stateOf(entry.path) === 'local');
}

export async function keep(manager: FileManager, entries: FileEntry[]) {
	await commands.cloudKeep({ paths: paths(entries) }).catch(manager.notify);
}

export async function free(manager: FileManager, entries: FileEntry[]) {
	history.working(t('rover-cloud-freeing'));
	try {
		await commands.cloudFree({ paths: paths(entries) }, { timeoutMs: 600_000 });
		history.inform(entries.length === 1 ? t('rover-cloud-freed-one', { name: entries[0].name }) : t('rover-cloud-freed'));
	} catch (caught) {
		history.dismiss();
		manager.notify(caught);
	}
}

export async function copyShareLink(manager: FileManager, entry: FileEntry) {
	try {
		const link = await commands.cloudShareLink({ path: entry.path }, { timeoutMs: 60_000 });
		await navigator.clipboard.writeText(link);
		history.inform(t('rover-cloud-link-copied'));
	} catch (caught) {
		manager.notify(caught);
	}
}

export async function openInBrowser(manager: FileManager, entry: FileEntry) {
	await api.openInBrowser(entry.path).catch(manager.notify);
}

export function describe(drive: Drive) {
	if (drive.state === 'signInAgain') return t('rover-cloud-sign-in-again');
	if (drive.state === 'offline') return drive.kept.length ? t('rover-cloud-offline-kept') : t('rover-cloud-offline');
	if (drive.state === 'connecting') return t('rover-cloud-connecting');
	if (drive.state === 'problem') return drive.problem ?? t('rover-cloud-not-connected');
	if (drive.paused) return drive.paused === 'metered' ? t('rover-cloud-paused-metered') : t('rover-cloud-paused-battery');
	if (drive.syncing > 0) return t('rover-cloud-syncing-changes', { count: drive.syncing });
	return drive.usage ? t('rover-cloud-usage', { used: bytes(drive.usage.used), total: bytes(drive.usage.total) }) : null;

}
