export type TilingMode = 'off' | 'tiling' | 'scrolling';
export type TilingLayout = 'dwindle' | 'master';
export type TilingGaps = 'none' | 'small' | 'medium' | 'large';
export type NewWindows = 'beside-focused' | 'at-end';

export type TilingSettings = {
	'window-tiling': TilingMode;
	'tiling-layout': TilingLayout;
	'tiling-gaps': TilingGaps;
	'tiling-new-windows': NewWindows;
};

export const TILING_KEYS: (keyof TilingSettings)[] = ['window-tiling', 'tiling-layout', 'tiling-gaps', 'tiling-new-windows'];

export const MODES: { value: TilingMode; label: string; description: string }[] = [
	{ value: 'off', label: 'settings-tiling-mode-off', description: 'settings-tiling-mode-off-description' },
	{ value: 'tiling', label: 'settings-tiling-mode-tiling', description: 'settings-tiling-mode-tiling-description' },
	{ value: 'scrolling', label: 'settings-tiling-mode-scrolling', description: 'settings-tiling-mode-scrolling-description' }
];

export const LAYOUTS: { value: TilingLayout; label: string }[] = [
	{ value: 'dwindle', label: 'settings-tiling-layout-dwindle' },
	{ value: 'master', label: 'settings-tiling-layout-master' }
];

export const GAPS: { value: TilingGaps; label: string; pixels: number }[] = [
	{ value: 'none', label: 'settings-tiling-gaps-none', pixels: 0 },
	{ value: 'small', label: 'settings-tiling-gaps-small', pixels: 5 },
	{ value: 'medium', label: 'settings-tiling-gaps-medium', pixels: 10 },
	{ value: 'large', label: 'settings-tiling-gaps-large', pixels: 20 }
];

export const NEW_WINDOWS: { value: NewWindows; label: string }[] = [
	{ value: 'beside-focused', label: 'settings-tiling-new-beside' },
	{ value: 'at-end', label: 'settings-tiling-new-at-end' }
];
