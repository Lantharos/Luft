export type Position = 'bottom' | 'left' | 'top' | 'right';
export type Alignment = 'center' | 'left';
export type Look = 'glass' | 'solid' | 'transparent' | 'accent';
export type Style = 'bar' | 'floating';
export type Size = 'compact' | 'normal' | 'large';
export type AutoHide = 'never' | 'always' | 'windows';
export type Displays = 'all' | 'primary';
export type StartStyle = 'menu' | 'palette';
export type WebSearch = 'duckduckgo' | 'google' | 'bing' | 'brave' | 'ecosia' | 'startpage' | 'kagi';

export type TaskbarSettings = {
	'taskbar-position': Position;
	'taskbar-alignment': Alignment;
	'taskbar-look': Look;
	'taskbar-style': Style;
	'taskbar-size': Size;
	'taskbar-auto-hide': AutoHide;
	'taskbar-show-pinned': boolean;
	'taskbar-displays': Displays;
	'taskbar-windows-per-display': boolean;
	'taskbar-windows-per-workspace': boolean;
	'taskbar-shown': boolean;
	'taskbar-start-button': boolean;
	'start-style': StartStyle;
	'search-web-engine': WebSearch;
	'favorite-apps': string[];
};

export const TASKBAR_KEYS: (keyof TaskbarSettings)[] = [
	'taskbar-position',
	'taskbar-alignment',
	'taskbar-look',
	'taskbar-style',
	'taskbar-size',
	'taskbar-auto-hide',
	'taskbar-show-pinned',
	'taskbar-displays',
	'taskbar-windows-per-display',
	'taskbar-windows-per-workspace',
	'taskbar-shown',
	'taskbar-start-button',
	'start-style',
	'search-web-engine',
	'favorite-apps'
];

export const START_STYLES: { value: StartStyle; label: string }[] = [
	{ value: 'menu', label: 'settings-start-style-menu' },
	{ value: 'palette', label: 'settings-start-style-palette' }
];

export const WEB_SEARCH: { value: WebSearch; label: string }[] = [
	{ value: 'duckduckgo', label: 'DuckDuckGo' },
	{ value: 'google', label: 'Google' },
	{ value: 'bing', label: 'Bing' },
	{ value: 'brave', label: 'Brave Search' },
	{ value: 'ecosia', label: 'Ecosia' },
	{ value: 'startpage', label: 'Startpage' },
	{ value: 'kagi', label: 'Kagi' }
];

export const POSITIONS: { value: Position; label: string }[] = [
	{ value: 'bottom', label: 'settings-taskbar-position-bottom' },
	{ value: 'left', label: 'settings-taskbar-position-left' },
	{ value: 'top', label: 'settings-taskbar-position-top' },
	{ value: 'right', label: 'settings-taskbar-position-right' }
];

export const isVertical = (position: Position) => position === 'left' || position === 'right';

export function alignments(position: Position): { value: Alignment; label: string }[] {
	return [
		{ value: 'center', label: 'settings-taskbar-align-center' },
		{ value: 'left', label: isVertical(position) ? 'settings-taskbar-align-top' : 'settings-taskbar-align-left' }
	];
}

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
