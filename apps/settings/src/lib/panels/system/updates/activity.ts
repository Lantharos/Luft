import { t } from '@luft/i18n';
import type { Activity } from '#lib/bindings.js';

export function describe(activity: Activity) {
	switch (activity.running) {
		case 'check':
			return t('settings-updates-checking');
		case 'download':
			return t('settings-updates-downloading');
		case 'rollback':
			return t('settings-updates-rolling-back');
		case 'switch':
			return activity.target === 'nvidia' ? t('settings-updates-switching-nvidia') : t('settings-updates-switching-standard');
		default:
			return null;
	}
}

export const fractionOf = (activity: Activity) => activity.progress?.fraction ?? null;

export const downloading = (activity: Activity) => activity.running === 'download' || activity.running === 'switch';

