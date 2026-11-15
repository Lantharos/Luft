import { t } from '@luft/i18n';

const MODIFIERS = {
	ctrl: 'rover-key-ctrl',
	alt: 'rover-key-alt',
	shift: 'rover-key-shift'
};

export function shortcutLabel(modifiers: (keyof typeof MODIFIERS)[], key: string) {
	return [...modifiers.map((modifier) => t(MODIFIERS[modifier])), key].join('+');
}
