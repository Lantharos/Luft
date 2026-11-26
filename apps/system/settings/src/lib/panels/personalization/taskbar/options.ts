import type { PresetName, StoredArrangement } from '@luft/ui/taskbar';

export type Look = 'glass' | 'solid' | 'transparent' | 'accent';
export type Style = 'bar' | 'floating' | 'separate';
export type Size = 'compact' | 'normal' | 'large';
export type AutoHide = 'never' | 'always' | 'windows';
export type Displays = 'all' | 'primary';
export type GustLook = 'panel' | 'palette';
export type WebSearch = 'duckduckgo' | 'google' | 'bing' | 'brave' | 'ecosia' | 'startpage' | 'kagi';

export type TaskbarSettings = {
	'taskbar-arrangement': StoredArrangement;
	'taskbar-look': Look;
	'taskbar-style': Style;
	'taskbar-size': Size;
	'taskbar-auto-hide': AutoHide;
	'taskbar-show-pinned': boolean;
	'taskbar-displays': Displays;
	'taskbar-windows-per-display': boolean;
	'taskbar-windows-per-workspace': boolean;
	'taskbar-badges': boolean;
	'taskbar-shown': boolean;
	'taskbar-gust-button': boolean;
	'gust-look': GustLook;
	'gust-pin-new-apps': boolean;
	'search-web-engine': WebSearch;
	'favorite-apps': string[];
};

export const TASKBAR_KEYS: (keyof TaskbarSettings)[] = [
	'taskbar-arrangement',
	'taskbar-look',
	'taskbar-style',
	'taskbar-size',
	'taskbar-auto-hide',
	'taskbar-show-pinned',
	'taskbar-displays',
	'taskbar-windows-per-display',
	'taskbar-windows-per-workspace',
	'taskbar-badges',
	'taskbar-shown',
	'taskbar-gust-button',
	'gust-look',
	'gust-pin-new-apps',
	'search-web-engine',
	'favorite-apps'
];

export const GUST_LOOKS: { value: GustLook; label: string }[] = [
	{ value: 'panel', label: 'settings-gust-look-panel' },
	{ value: 'palette', label: 'settings-gust-look-palette' }
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

export const PRESETS: { value: PresetName; label: string }[] = [
	{ value: 'classic', label: 'settings-taskbar-preset-classic' },
	{ value: 'centered', label: 'settings-taskbar-preset-centered' },
	{ value: 'mac', label: 'settings-taskbar-preset-mac' },
	{ value: 'side', label: 'settings-taskbar-preset-side' }
];

export const LOOKS: { value: Look; label: string }[] = [
	{ value: 'glass', label: 'settings-taskbar-look-glass' },
	{ value: 'solid', label: 'settings-taskbar-look-solid' },
	{ value: 'transparent', label: 'settings-taskbar-look-transparent' },
	{ value: 'accent', label: 'settings-taskbar-look-accent' }
];

export const STYLES: { value: Style; label: string }[] = [
	{ value: 'bar', label: 'settings-taskbar-shape-bar' },
	{ value: 'floating', label: 'settings-taskbar-shape-floating' },
	{ value: 'separate', label: 'settings-taskbar-shape-separate' }
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
