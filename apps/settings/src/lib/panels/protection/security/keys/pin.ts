import { t } from '@luft/i18n';

export const PIN_LENGTH = { min: 6, max: 20 };

export function pinProblem(pin: string) {
	if (/\D/.test(pin)) return t('settings-encryption-pin-digits-only');
	if (pin.length > PIN_LENGTH.max) return t('settings-encryption-pin-too-long', { max: PIN_LENGTH.max });
	return '';
}

export const pinReady = (pin: string, confirmation: string) => !pinProblem(pin) && pin.length >= PIN_LENGTH.min && pin === confirmation;
