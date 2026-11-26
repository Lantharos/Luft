import { t } from '@luft/i18n';
import type { Adjustment, AdjustmentType } from './adjustments';

export interface Field {
	label: () => string;
	min: number;
	max: number;
	step: number;
	get: (adjustment: Adjustment) => number;
	set: (adjustment: Adjustment, value: number) => void;
}

const field = (label: () => string, min: number, max: number, step: number, get: Field['get'], set: Field['set']): Field => ({ label, min, max, step, get, set });

export type Tone = 'shadows' | 'midtones' | 'highlights';

export function fieldsFor(type: AdjustmentType, tone: Tone): Field[] {
	switch (type) {
		case 'levels':
			return [
				field(() => t('easel-levels-black'), 0, 0.9, 0.01, (a) => a.levels.black, (a, v) => (a.levels.black = v)),
				field(() => t('easel-levels-white'), 0.1, 1, 0.01, (a) => a.levels.white, (a, v) => (a.levels.white = v)),
				field(() => t('easel-levels-gamma'), 0.2, 3, 0.01, (a) => a.levels.gamma, (a, v) => (a.levels.gamma = v)),
				field(() => t('easel-levels-out-black'), 0, 1, 0.01, (a) => a.levels.outBlack, (a, v) => (a.levels.outBlack = v)),
				field(() => t('easel-levels-out-white'), 0, 1, 0.01, (a) => a.levels.outWhite, (a, v) => (a.levels.outWhite = v))
			];
		case 'hue':
			return [
				field(() => t('easel-hue-hue'), -180, 180, 1, (a) => a.hue.hue, (a, v) => (a.hue.hue = v)),
				field(() => t('easel-hue-saturation'), -1, 1, 0.01, (a) => a.hue.saturation, (a, v) => (a.hue.saturation = v)),
				field(() => t('easel-hue-lightness'), -1, 1, 0.01, (a) => a.hue.lightness, (a, v) => (a.hue.lightness = v))
			];
		case 'balance':
			return (
				[
					[() => t('easel-balance-red'), 0],
					[() => t('easel-balance-green'), 1],
					[() => t('easel-balance-blue'), 2]
				] as const
			).map(([label, channel]) =>
				field(label, -1, 1, 0.01, (a) => a.balance[tone][channel], (a, v) => (a.balance[tone][channel] = v))
			);
		case 'mono':
			return [
				field(() => t('easel-balance-red'), 0, 1, 0.01, (a) => a.mono.red, (a, v) => (a.mono.red = v)),
				field(() => t('easel-balance-green'), 0, 1, 0.01, (a) => a.mono.green, (a, v) => (a.mono.green = v)),
				field(() => t('easel-balance-blue'), 0, 1, 0.01, (a) => a.mono.blue, (a, v) => (a.mono.blue = v)),
				field(() => t('easel-mono-tint'), 0, 1, 0.01, (a) => a.mono.tintAmount, (a, v) => (a.mono.tintAmount = v))
			];
		case 'brightness':
			return [
				field(() => t('easel-brightness'), -1, 1, 0.01, (a) => a.brightness.brightness, (a, v) => (a.brightness.brightness = v)),
				field(() => t('easel-contrast'), -0.9, 0.9, 0.01, (a) => a.brightness.contrast, (a, v) => (a.brightness.contrast = v))
			];
		case 'exposure':
			return [
				field(() => t('easel-exposure'), -4, 4, 0.01, (a) => a.exposure.exposure, (a, v) => (a.exposure.exposure = v)),
				field(() => t('easel-exposure-offset'), -0.5, 0.5, 0.01, (a) => a.exposure.offset, (a, v) => (a.exposure.offset = v)),
				field(() => t('easel-exposure-gamma'), 0.2, 3, 0.01, (a) => a.exposure.gamma, (a, v) => (a.exposure.gamma = v))
			];
		case 'vibrance':
			return [
				field(() => t('easel-vibrance'), -1, 1, 0.01, (a) => a.vibrance.vibrance, (a, v) => (a.vibrance.vibrance = v)),
				field(() => t('easel-hue-saturation'), -1, 1, 0.01, (a) => a.vibrance.saturation, (a, v) => (a.vibrance.saturation = v))
			];
		default:
			return [];
	}
}

export const adjustmentName: Record<AdjustmentType, () => string> = {
	curves: () => t('easel-adjustment-curves'),
	levels: () => t('easel-adjustment-levels'),
	hue: () => t('easel-adjustment-hue'),
	balance: () => t('easel-adjustment-balance'),
	mono: () => t('easel-adjustment-mono'),
	brightness: () => t('easel-adjustment-brightness'),
	exposure: () => t('easel-adjustment-exposure'),
	vibrance: () => t('easel-adjustment-vibrance')
};
