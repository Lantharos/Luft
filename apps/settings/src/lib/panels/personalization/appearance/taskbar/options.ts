export type Alignment = 'center' | 'left';
export type Look = 'glass' | 'solid' | 'transparent' | 'accent';
export type Style = 'bar' | 'floating';
export type Size = 'compact' | 'normal' | 'large';
export type AutoHide = 'never' | 'always' | 'windows';
export type Displays = 'all' | 'primary';

export type TaskbarSettings = {
	'taskbar-alignment': Alignment;
	'taskbar-look': Look;
	'taskbar-style': Style;
	'taskbar-size': Size;
	'taskbar-auto-hide': AutoHide;
	'taskbar-show-pinned': boolean;
	'taskbar-displays': Displays;
	'taskbar-windows-per-display': boolean;
	'taskbar-windows-per-workspace': boolean;
	'favorite-apps': string[];
};

export const TASKBAR_KEYS: (keyof TaskbarSettings)[] = [
	'taskbar-alignment',
	'taskbar-look',
	'taskbar-style',
	'taskbar-size',
	'taskbar-auto-hide',
	'taskbar-show-pinned',
	'taskbar-displays',
	'taskbar-windows-per-display',
	'taskbar-windows-per-workspace',
	'favorite-apps'
];

export const ALIGNMENTS: { value: Alignment; label: string }[] = [
	{ value: 'center', label: 'settings-taskbar-align-center' },
	{ value: 'left', label: 'settings-taskbar-align-left' }
];

export const LOOKS: { value: Look; label: string }[] = [
	{ value: 'glass', label: 'settings-taskbar-look-glass' },
	{ value: 'solid', label: 'settings-taskbar-look-solid' },
	{ value: 'transparent', label: 'settings-taskbar-look-transparent' },
	{ value: 'accent', label: 'settings-taskbar-look-accent' }
];

export const STYLES: { value: Style; label: string }[] = [
	{ value: 'bar', label: 'settings-taskbar-shape-bar' },
	{ value: 'floating', label: 'settings-taskbar-shape-floating' }
];

export const SIZES: { value: Size; label: string }[] = [
	{ value: 'compact', label: 'settings-taskbar-size-small' },
	{ value: 'normal', label: 'settings-taskbar-size-medium' },
	{ value: 'large', label: 'settings-taskbar-size-large' }
];

export const AUTO_HIDE: { value: AutoHide; label: string }[] = [
	{ value: 'never', label: 'settings-taskbar-hide-never' },
	{ value: 'always', label: 'settings-taskbar-hide-always' },
	{ value: 'windows', label: 'settings-taskbar-hide-windows' }
];
