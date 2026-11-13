import type { AppIconStyle } from '../appearance.svelte';

export type AppIconLook = AppIconStyle | 'plain';

const LUFT_APP = 'com.lantharos.';
const ROUND_COVERAGE = Math.PI / 4;
const SQUARE_EXTENT = 0.95;
const PLATE_CORNER = 0.225;

const plateCoverage = 1 - (4 - Math.PI) * PLATE_CORNER ** 2;
const plateSquareness = Math.min(1, Math.max(0, (plateCoverage - ROUND_COVERAGE) / (1 - ROUND_COVERAGE)));

export const FITTED_PLATE = 1 - (1 - SQUARE_EXTENT) * plateSquareness;

export const appIconLook = (id: string | undefined, style: AppIconStyle): AppIconLook =>
	style === 'default' && id?.startsWith(LUFT_APP) ? 'plain' : style;
