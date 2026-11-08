import { t } from '@luft/i18n';
import type { Extension } from '#lib/bindings.js';

const PROBLEMS: Record<string, string> = {
	failed: 'settings-extensions-failed',
	crashed: 'settings-extensions-crashed',
	invalid: 'settings-extensions-invalid'
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
	const problem = PROBLEMS[extension.state];
	return problem ? t(problem) : extension.description;
}
