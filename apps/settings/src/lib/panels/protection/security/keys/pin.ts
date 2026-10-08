export const PIN_LENGTH = { min: 6, max: 20 };

export function pinProblem(pin: string) {
	if (/\D/.test(pin)) return 'Use digits only';
	if (pin.length > PIN_LENGTH.max) return `Use at most ${PIN_LENGTH.max} digits`;
	return '';
}

export const pinReady = (pin: string, confirmation: string) => !pinProblem(pin) && pin.length >= PIN_LENGTH.min && pin === confirmation;
