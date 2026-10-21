export type PanelId =
	| 'network'
	| 'bluetooth'
	| 'display'
	| 'sound'
	| 'power'
	| 'appearance'
	| 'notifications'
	| 'keyboard'
	| 'mouse'
	| 'accessibility'
	| 'apps'
	| 'privacy'
	| 'security'
	| 'region'
	| 'datetime'
	| 'users'
	| 'accounts'
	| 'login'
	| 'updates'
	| 'about';

export type SubpageId = 'appearance/taskbar' | 'appearance/tiling' | 'appearance/fonts' | 'appearance/cursors' | 'keyboard/dictation' | 'accounts/add';

export type PageId = PanelId | SubpageId;

export interface Page<Id extends PageId = PageId> {
	id: Id;
	title: string;
	symbol: string;
	copilotKey?: boolean;
}

export type Translate = (id: string) => string;

const page = <Id extends PageId>(id: Id, title: string, symbol: string, copilotKey?: boolean): Page<Id> => ({ id, title, symbol, copilotKey });

export const PANEL_PAGES: Page<PanelId>[][] = [
	[page('network', 'settings-page-network', 'network-wireless-symbolic'), page('bluetooth', 'settings-page-bluetooth', 'bluetooth-active-symbolic')],
	[
		page('display', 'settings-page-display', 'video-display-symbolic'),
		page('sound', 'settings-page-sound', 'audio-speakers-symbolic'),
		page('power', 'settings-page-power', 'battery-full-charging-symbolic')
	],
	[
		page('appearance', 'settings-page-appearance', 'preferences-desktop-appearance-symbolic'),
		page('notifications', 'settings-page-notifications', 'preferences-system-notifications-symbolic')
	],
	[
		page('keyboard', 'settings-page-keyboard', 'input-keyboard-symbolic', true),
		page('mouse', 'settings-page-mouse', 'input-mouse-symbolic'),
		page('accessibility', 'settings-page-accessibility', 'preferences-desktop-accessibility-symbolic')
	],
	[
		page('apps', 'settings-page-apps', 'view-app-grid-symbolic'),
		page('privacy', 'settings-page-privacy', 'preferences-system-privacy-symbolic'),
		page('security', 'settings-page-security', 'security-high-symbolic')
	],
	[
		page('region', 'settings-page-region', 'preferences-desktop-locale-symbolic'),
		page('datetime', 'settings-page-datetime', 'preferences-system-time-symbolic'),
		page('users', 'settings-page-users', 'system-users-symbolic'),
		page('accounts', 'settings-page-accounts', 'folder-remote-symbolic'),
		page('login', 'settings-page-login', 'system-lock-screen-symbolic'),
		page('updates', 'settings-page-updates', 'software-update-available-symbolic'),
		page('about', 'settings-page-about', 'help-about-symbolic')
	]
];

export const SUBPAGES: Page<SubpageId>[] = [
	page('appearance/taskbar', 'settings-page-taskbar', 'user-desktop-symbolic'),
	page('appearance/tiling', 'settings-page-tiling', 'view-dual-symbolic'),
	page('appearance/fonts', 'settings-page-fonts', 'preferences-desktop-font-symbolic'),
	page('appearance/cursors', 'settings-page-cursors', 'input-mouse-symbolic'),
	page('keyboard/dictation', 'settings-page-dictation', 'audio-input-microphone-symbolic', true),
	page('accounts/add', 'settings-page-add-account', 'list-add-symbolic')
];

export const PAGES: Page[] = [...PANEL_PAGES.flat(), ...SUBPAGES];

export const pageTitle = (page: Page, t: Translate) => t(page.title);

const terms = (text: string) =>
	text
		.split(',')
		.map((term) => term.trim())
		.filter(Boolean);

const keywordsIn = (page: Page, copilotKey: boolean, t: Translate) => [
	...terms(t(`${page.title}.keywords`)),
	...(copilotKey && page.copilotKey ? terms(t(`${page.title}.copilot-key`)) : [])
];

export function pageKeywords(page: Page, copilotKey: boolean, t: Translate, english?: Translate): string[] {
	const keywords = keywordsIn(page, copilotKey, t);
	return english ? [...keywords, english(page.title), ...keywordsIn(page, copilotKey, english)] : keywords;
}
