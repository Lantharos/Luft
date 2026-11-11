import { t } from '@luft/i18n';
import type { Extension } from '#lib/bindings.js';

const PROBLEMS: Record<string, string> = {
	failed: 'settings-extensions-failed',
	crashed: 'settings-extensions-crashed',
	invalid: 'settings-extensions-invalid',
	'runs-separately': 'settings-extensions-runs-separately'
};

const ORIGINS: Record<string, string> = {
	store: 'settings-extensions-from-store',
	development: 'settings-extensions-from-development',
	own: 'settings-extensions-from-own'
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

export function summary(extension: Extension): string {
	if (extension.state === 'needs-newer-luft') return t('settings-extensions-needs-newer-luft', { version: extension.luft });
	const problem = PROBLEMS[extension.state];
	return problem ? t(problem) : extension.description;
}

export const origin = (extension: Extension) => t(ORIGINS[extension.origin] ?? ORIGINS.own);
