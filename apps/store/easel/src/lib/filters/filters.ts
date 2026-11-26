import { t } from '@luft/i18n';

export type FilterKind = 'blur' | 'motion' | 'sharpen' | 'denoise' | 'vignette' | 'pixelate';

export const FILTERS: FilterKind[] = ['blur', 'motion', 'sharpen', 'denoise', 'vignette', 'pixelate'];

export interface FilterField {
	key: string;
	label: () => string;
	min: number;
	max: number;
	step: number;
	value: number;
}

export const filterName: Record<FilterKind, () => string> = {
	blur: () => t('easel-filter-blur'),
	motion: () => t('easel-filter-motion'),
	sharpen: () => t('easel-filter-sharpen'),
	denoise: () => t('easel-filter-denoise'),
	vignette: () => t('easel-filter-vignette'),
	pixelate: () => t('easel-filter-pixelate')
};

export function filterFields(kind: FilterKind): FilterField[] {
	switch (kind) {
		case 'blur':
			return [{ key: 'radius', label: () => t('easel-filter-radius'), min: 0.5, max: 100, step: 0.5, value: 6 }];
		case 'motion':
			return [
				{ key: 'angle', label: () => t('easel-filter-angle'), min: -180, max: 180, step: 1, value: 0 },
				{ key: 'distance', label: () => t('easel-filter-distance'), min: 1, max: 300, step: 1, value: 40 }
			];
		case 'sharpen':
			return [
				{ key: 'amount', label: () => t('easel-filter-amount'), min: 0, max: 3, step: 0.05, value: 0.8 },
				{ key: 'radius', label: () => t('easel-filter-radius'), min: 0.5, max: 20, step: 0.5, value: 2 },
				{ key: 'threshold', label: () => t('easel-filter-threshold'), min: 0, max: 0.2, step: 0.005, value: 0.01 }
			];
		case 'denoise':
			return [{ key: 'strength', label: () => t('easel-filter-strength'), min: 0.01, max: 0.4, step: 0.01, value: 0.1 }];
		case 'vignette':
			return [
				{ key: 'amount', label: () => t('easel-filter-amount'), min: 0, max: 1, step: 0.01, value: 0.5 },
				{ key: 'size', label: () => t('easel-filter-size'), min: 0, max: 0.95, step: 0.01, value: 0.4 }
			];
		default:
			return [{ key: 'block', label: () => t('easel-filter-block'), min: 2, max: 120, step: 1, value: 16 }];
	}
}
