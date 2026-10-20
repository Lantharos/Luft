import { t } from '@luft/i18n';

export const cursorSizes = () => [
	{ value: 24, label: t('settings-cursors-size-default') },
	{ value: 32, label: t('settings-cursors-size-medium') },
	{ value: 48, label: t('settings-cursors-size-large') },
	{ value: 64, label: t('settings-cursors-size-larger') },
	{ value: 96, label: t('settings-cursors-size-largest') }
];
