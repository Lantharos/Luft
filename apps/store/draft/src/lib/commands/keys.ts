import { t } from '@luft/i18n';

const ALIASES: Record<string, string> = { '+': '=', ' ': 'Space', Esc: 'Escape' };

export function combo(event: KeyboardEvent) {
	const key = ALIASES[event.key] ?? (event.key.length === 1 ? event.key.toUpperCase() : event.key);
	return [event.ctrlKey && 'Ctrl', event.altKey && 'Alt', event.shiftKey && 'Shift', key].filter(Boolean).join('+');
}

export function tabNumber(event: KeyboardEvent) {
	if (!event.altKey || event.ctrlKey || event.shiftKey) return null;
	const digit = Number.parseInt(event.key, 10);
	return digit >= 1 && digit <= 9 ? digit : null;
}

function keyName(key: string) {
	switch (key) {
		case 'Ctrl':
			return t('draft-key-ctrl');
		case 'Alt':
			return t('draft-key-alt');
		case 'Shift':
			return t('draft-key-shift');
		case 'Tab':
			return t('draft-key-tab');
		default:
			return key;
	}
}

export const keyNames = (keys: string) => keys.split('+').map(keyName);
export const shortcutLabel = (keys: string) => keyNames(keys).join('+');
