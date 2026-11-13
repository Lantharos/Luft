import { bytes } from '@luft/ui';
import type { InstalledApp, Operation } from '#lib/bindings.js';

export function sourceName({ source, origin, listing }: Pick<InstalledApp, 'source' | 'origin' | 'listing'>) {
	if (listing) return source === 'extension' ? 'Extension from schelf.store' : 'schelf.store';
	if (source === 'appImage') return 'Installed from a file';
	if (source === 'tool') return 'Command-line tool';
	if (source === 'storeTool') return 'Command-line tool from schelf.store';
	if (source === 'debian') return 'Made for Ubuntu';
	if (source === 'system') return origin === 'Fedora' ? 'Part of the system' : `Part of the system, from ${origin}`;
	return origin === 'flathub' ? 'Flathub' : origin;
}

const VERBS: Record<Operation['action'], [string, string]> = {
	install: ['Installing', 'Waiting to install'],
	remove: ['Removing', 'Waiting to remove'],
	update: ['Updating', 'Waiting to update']
};

export function activity(operation: Operation) {
	const [running, queued] = VERBS[operation.action];
	if (operation.state === 'queued' || operation.progress?.stage === 'waiting') return queued;
	if (operation.progress?.stage === 'preparing') return 'Getting ready';
	if (operation.progress?.stage === 'downloading') return 'Downloading';
	return running;
}

export const percent = (operation: Operation) => (operation.progress?.fraction == null ? null : Math.round(operation.progress.fraction * 100));

export function transferred(operation: Operation) {
	const transfer = operation.progress?.stage === 'downloading' ? operation.progress.transfer : null;
	return transfer ? `${bytes(transfer.done)} of ${bytes(transfer.total)}` : null;
}
