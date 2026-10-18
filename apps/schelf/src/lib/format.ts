import type { Operation, Source } from '#lib/bridge/types.js';

export const date = (seconds: number) => new Date(seconds * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

export function sourceName(source: Source, origin: string) {
	if (source === 'appImage') return 'AppImage';
	if (source === 'tool') return 'Tools container';
	if (source === 'system') return 'System package';
	if (source === 'package') return origin || 'System package';
	return origin === 'flathub' ? 'Flathub' : origin;
}

const VERBS: Record<Operation['action'], [string, string]> = {
	install: ['Installing', 'Waiting to install'],
	remove: ['Removing', 'Waiting to remove'],
	update: ['Updating', 'Waiting to update']
};

export function activity(operation: Operation) {
	const [running, queued] = VERBS[operation.action];
	if (operation.progress?.stage === 'downloading') return 'Downloading';
	if (operation.state === 'queued' || operation.progress?.stage === 'waiting') return queued;
	return running;
}

export const percent = (operation: Operation) => (operation.progress?.fraction == null ? null : Math.round(operation.progress.fraction * 100));
