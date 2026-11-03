import { i18n, t } from '@luft/i18n';
import { memoryBytes } from '@luft/ui';
import type { Extension } from '#lib/bindings.js';

const PROBLEMS: Record<string, string> = {
	failed: 'settings-extensions-failed',
	crashed: 'settings-extensions-crashed',
	invalid: 'settings-extensions-invalid'
};

const MEASURABLE = 0.001;

export const PERMISSIONS: Record<string, string> = {
	wallpaper: 'settings-extensions-permission-wallpaper',
	'quick-settings': 'settings-extensions-permission-quick-settings',
	taskbar: 'settings-extensions-permission-taskbar',
	search: 'settings-extensions-permission-search',
	notifications: 'settings-extensions-permission-notifications',
	weather: 'settings-extensions-permission-weather',
	location: 'settings-extensions-permission-location',
	media: 'settings-extensions-permission-media'
};

export function summary(extension: Extension): string {
	const problem = PROBLEMS[extension.state];
	return problem ? t(problem) : extension.description;
}

export function usage(extension: Extension): string | null {
	if (extension.cpu === null) return null;
	if (extension.cpu < MEASURABLE && !extension.memory) return t('settings-extensions-usage-little');
	const cpu = new Intl.NumberFormat(i18n.formats, { style: 'percent', maximumFractionDigits: 1 }).format(extension.cpu);
	return extension.memory
		? t('settings-extensions-usage-helper', { cpu, memory: memoryBytes(extension.memory) })
		: t('settings-extensions-usage', { cpu });
}
