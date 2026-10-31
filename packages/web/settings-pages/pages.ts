export type PanelId =
	| 'network'
	| 'bluetooth'
	| 'display'
	| 'sound'
	| 'power'
	| 'input'
	| 'appearance'
	| 'taskbar'
	| 'windows'
	| 'accessibility'
	| 'apps'
	| 'privacy'
	| 'security'
	| 'accounts'
	| 'language'
	| 'system';

export type SubpageId =
	| 'network/wifi'
	| 'network/ethernet'
	| 'network/vpn'
	| 'network/proxy'
	| 'input/shortcuts'
	| 'input/dictation'
	| 'security/encryption'
	| 'security/keyring'
	| 'accounts/login'
	| 'accounts/add'
	| 'system/about';

export type PageId = PanelId | SubpageId;

export interface Page<Id extends PageId = PageId> {
	id: Id;
	title: string;
	symbol: string;
	keywords: string[];
	copilotKey?: string;
}

interface Search {
	keywords?: string[];
	copilotKey?: string;
}

export type Translate = (id: string) => string;

const page = <Id extends PageId>(id: Id, title: string, symbol: string, { keywords = [title], copilotKey }: Search = {}): Page<Id> => ({
	id,
	title,
	symbol,
	keywords,
	copilotKey
});

export const PANEL_PAGES: Page<PanelId>[][] = [
	[page('network', 'settings-page-network', 'network-wireless-symbolic'), page('bluetooth', 'settings-page-bluetooth', 'bluetooth-active-symbolic')],
	[
		page('display', 'settings-page-display', 'video-display-symbolic'),
		page('sound', 'settings-page-sound', 'audio-speakers-symbolic'),
		page('power', 'settings-page-power', 'battery-full-charging-symbolic'),
		page('input', 'settings-page-input', 'input-keyboard-symbolic', {
			keywords: ['settings-page-keyboard', 'settings-page-mouse'],
			copilotKey: 'settings-page-keyboard'
		})
	],
	[
		page('appearance', 'settings-page-appearance', 'preferences-desktop-appearance-symbolic', {
			keywords: ['settings-page-appearance', 'settings-page-wallpaper', 'settings-page-corners', 'settings-page-fonts', 'settings-page-cursors']
		}),
		page('taskbar', 'settings-page-taskbar', 'user-desktop-symbolic'),
		page('windows', 'settings-page-windows', 'focus-windows-symbolic', { keywords: ['settings-page-windows', 'settings-page-tiling'] }),
		page('accessibility', 'settings-page-accessibility', 'preferences-desktop-accessibility-symbolic')
	],
	[
		page('apps', 'settings-page-apps', 'view-app-grid-symbolic'),
		page('privacy', 'settings-page-privacy', 'preferences-system-privacy-symbolic'),
		page('security', 'settings-page-security', 'security-high-symbolic')
	],
	[
		page('accounts', 'settings-page-accounts', 'system-users-symbolic', { keywords: ['settings-page-users', 'settings-page-accounts'] }),
		page('language', 'settings-page-language', 'preferences-desktop-locale-symbolic', { keywords: ['settings-page-region', 'settings-page-datetime'] }),
		page('system', 'settings-page-system', 'software-update-available-symbolic', { keywords: ['settings-page-updates'] })
	]
];

export const SUBPAGES: Page<SubpageId>[] = [
	page('network/wifi', 'settings-page-wifi', 'network-wireless-symbolic', { keywords: [] }),
	page('network/ethernet', 'settings-page-ethernet', 'network-wired-symbolic', { keywords: [] }),
	page('network/vpn', 'settings-page-vpn', 'network-vpn-symbolic', { keywords: [] }),
	page('network/proxy', 'settings-page-proxy', 'preferences-system-network-proxy-symbolic', { keywords: [] }),
	page('input/shortcuts', 'settings-page-shortcuts', 'preferences-desktop-keyboard-shortcuts-symbolic', { keywords: [] }),
	page('input/dictation', 'settings-page-dictation', 'audio-input-microphone-symbolic', { copilotKey: 'settings-page-dictation' }),
	page('security/encryption', 'settings-page-encryption', 'drive-harddisk-symbolic', { keywords: [] }),
	page('security/keyring', 'settings-page-keyring', 'dialog-password-symbolic', { keywords: [] }),
	page('accounts/login', 'settings-page-login', 'system-lock-screen-symbolic'),
	page('accounts/add', 'settings-page-add-account', 'list-add-symbolic'),
	page('system/about', 'settings-page-about', 'help-about-symbolic')
];

export const PAGES: Page[] = [...PANEL_PAGES.flat(), ...SUBPAGES];

export const pageTitle = (page: Page, t: Translate) => t(page.title);

const terms = (text: string) =>
	text
		.split(',')
		.map((term) => term.trim())
		.filter(Boolean);

const keywordsIn = (page: Page, copilotKey: boolean, t: Translate) => [
	...page.keywords.flatMap((source) => [...(source === page.title ? [] : [t(source)]), ...terms(t(`${source}.keywords`))]),
	...(copilotKey && page.copilotKey ? terms(t(`${page.copilotKey}.copilot-key`)) : [])
];

export function pageKeywords(page: Page, copilotKey: boolean, t: Translate, english?: Translate): string[] {
	const keywords = keywordsIn(page, copilotKey, t);
	return english ? [...keywords, english(page.title), ...keywordsIn(page, copilotKey, english)] : keywords;
}
