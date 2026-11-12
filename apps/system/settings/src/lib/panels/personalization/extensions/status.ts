import { t } from '@luft/i18n';
import type { Extension } from '#lib/bindings.js';
import { extensions } from './extensions.svelte';

const PROBLEMS: Record<string, string> = {
	failed: 'settings-extensions-failed',
	crashed: 'settings-extensions-crashed',
	invalid: 'settings-extensions-invalid',
	'store-only': 'settings-extensions-store-only'
};

const ORIGINS: Record<string, string> = {
	store: 'settings-extensions-from-store',
	copy: 'settings-extensions-from-copy',
	development: 'settings-extensions-from-development',
	folder: 'settings-extensions-from-folder',
	own: 'settings-extensions-from-own'
};

const UNREVIEWED: Record<string, { inside: string; sandboxed: string }> = {
	copy: { inside: 'settings-extensions-unreviewed-copy', sandboxed: 'settings-extensions-unreviewed-copy-sandboxed' },
	folder: { inside: 'settings-extensions-unreviewed-folder', sandboxed: 'settings-extensions-unreviewed-folder-sandboxed' }
};

export const PERMISSIONS: Record<string, string> = {
	wallpaper: 'settings-extensions-permission-wallpaper',
	'quick-settings': 'settings-extensions-permission-quick-settings',
	taskbar: 'settings-extensions-permission-taskbar',
	search: 'settings-extensions-permission-search',
	notifications: 'settings-extensions-permission-notifications',
	weather: 'settings-extensions-permission-weather',
	location: 'settings-extensions-permission-location',
	media: 'settings-extensions-permission-media',
	popups: 'settings-extensions-permission-popups',
	typing: 'settings-extensions-permission-typing',
	sounds: 'settings-extensions-permission-sounds',
	'audio-levels': 'settings-extensions-permission-audio-levels',
	calls: 'settings-extensions-permission-calls',
	'locked-sounds': 'settings-extensions-permission-locked-sounds',
	'input-sounds': 'settings-extensions-permission-input-sounds',
	'do-not-disturb': 'settings-extensions-permission-do-not-disturb',
	'screen-effects': 'settings-extensions-permission-screen-effects',
	clipboard: 'settings-extensions-permission-clipboard',
	'file-actions': 'settings-extensions-permission-file-actions'
};

function detail(extension: Extension, unreviewed: boolean): string {
	if (extension.state === 'needs-newer-luft') return t('settings-extensions-needs-newer-luft', { version: extension.luft });
	if (unreviewed && extension.state === 'store-only') return t('settings-extensions-store-only-unreviewed');
	const problem = PROBLEMS[extension.state];
	return problem ? t(problem) : extension.description;
}

export function unreviewedNote(extension: Extension): string | null {
	const note = UNREVIEWED[extension.origin];
	return note ? t(extensions.developerTools ? note.inside : note.sandboxed) : null;
}

export function summary(extension: Extension): string {
	const note = unreviewedNote(extension);
	const rest = detail(extension, !!note);
	if (!note || !rest) return note ?? rest;
	return t('settings-extensions-unreviewed-summary', { note, rest });
}

export const origin = (extension: Extension) => t(ORIGINS[extension.origin] ?? ORIGINS.own);
