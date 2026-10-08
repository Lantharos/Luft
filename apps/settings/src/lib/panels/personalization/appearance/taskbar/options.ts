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
	{ value: 'center', label: 'Center' },
	{ value: 'left', label: 'Left' }
];

export const LOOKS: { value: Look; label: string }[] = [
	{ value: 'glass', label: 'Glass' },
	{ value: 'solid', label: 'Solid' },
	{ value: 'transparent', label: 'Transparent' },
	{ value: 'accent', label: 'Accent' }
];

export const STYLES: { value: Style; label: string }[] = [
	{ value: 'bar', label: 'Edge to edge' },
	{ value: 'floating', label: 'Floating' }
];

export const SIZES: { value: Size; label: string }[] = [
	{ value: 'compact', label: 'Small' },
	{ value: 'normal', label: 'Medium' },
	{ value: 'large', label: 'Large' }
];

export const AUTO_HIDE: { value: AutoHide; label: string }[] = [
	{ value: 'never', label: 'Never' },
	{ value: 'always', label: 'Always' },
	{ value: 'windows', label: 'When a window touches it' }
];
