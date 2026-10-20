import { t } from '@luft/i18n';
import type { Activity, Elsewhere } from './api';

const capitalized = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

function elsewhere({ by, change }: Elsewhere) {
	switch (change) {
		case 'refresh':
			return by ? capitalized(t('settings-updates-elsewhere-refresh-by', { app: by })) : t('settings-updates-checking');
		case 'download':
			return by ? capitalized(t('settings-updates-elsewhere-download-by', { app: by })) : t('settings-updates-downloading');
		case 'update':
			return by ? capitalized(t('settings-updates-elsewhere-update-by', { app: by })) : t('settings-updates-elsewhere-update');
		case 'install':
			return by ? capitalized(t('settings-updates-elsewhere-install-by', { app: by })) : t('settings-updates-elsewhere-install');
		case 'remove':
			return by ? capitalized(t('settings-updates-elsewhere-remove-by', { app: by })) : t('settings-updates-elsewhere-remove');
		default:
			return by ? capitalized(t('settings-updates-elsewhere-change-by', { app: by })) : t('settings-updates-elsewhere-change');
	}
}

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
		case 'elsewhere':
			return activity.elsewhere ? elsewhere(activity.elsewhere) : null;
		default:
			return null;
	}
}

export const fractionOf = (activity: Activity) => activity.progress?.fraction ?? null;

export const downloading = (activity: Activity) => activity.running === 'download' || activity.running === 'switch';

export const showsProgress = (activity: Activity) => downloading(activity) || activity.running === 'elsewhere';
