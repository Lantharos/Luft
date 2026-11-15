import { t } from '@luft/i18n';

function keyName(key: string) {
	switch (key) {
		case 'Shift':
			return t('mailman-key-shift');
		case 'Ctrl':
			return t('mailman-key-ctrl');
		case 'Enter':
			return t('mailman-key-enter');
		case 'Esc':
			return t('mailman-key-escape');
		default:
			return key;
	}
}

export const keyNames = (keys: string) => keys.split(' ').map(keyName).join(' ');
