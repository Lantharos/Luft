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
	| 'datetime'
	| 'users'
	| 'accounts'
	| 'login'
	| 'updates'
	| 'about';

export type SubpageId = 'appearance/taskbar' | 'appearance/fonts' | 'appearance/cursors' | 'keyboard/dictation' | 'accounts/add';

export type PageId = PanelId | SubpageId;

export interface Page<Id extends PageId = PageId> {
	id: Id;
	title: string;
	symbol: string;
	keywords: string[];
}

const page = <Id extends PageId>(id: Id, title: string, symbol: string, keywords: string[]): Page<Id> => ({ id, title, symbol, keywords });

export const PANEL_PAGES: Page<PanelId>[][] = [
	[
		page('network', 'Network', 'network-wireless-symbolic', ['wifi', 'wireless', 'ethernet', 'wired', 'vpn', 'internet', 'airplane', 'proxy', 'dns', 'ip address', 'hardware address', 'metered']),
		page('bluetooth', 'Bluetooth', 'bluetooth-active-symbolic', ['devices', 'pair', 'headphones', 'speaker', 'visible', 'discoverable'])
	],
	[
		page('display', 'Displays', 'video-display-symbolic', ['monitor', 'screen', 'resolution', 'scale', 'refresh rate', 'night light', 'arrangement', 'brightness']),
		page('sound', 'Sound', 'audio-speakers-symbolic', ['audio', 'volume', 'speakers', 'microphone', 'output', 'input', 'alerts']),
		page('power', 'Power & Battery', 'battery-full-charging-symbolic', ['battery', 'sleep', 'suspend', 'power mode', 'screen blank', 'lid', 'charge limit'])
	],
	[
		page('appearance', 'Appearance', 'preferences-desktop-appearance-symbolic', ['wallpaper', 'background', 'dark', 'light', 'style', 'accent', 'app icons', 'tinted', 'cursor', 'pointer', 'mouse pointer', 'cursor size', 'text size', 'animations', 'fonts', 'typefaces', 'install fonts']),
		page('notifications', 'Notifications', 'preferences-system-notifications-symbolic', ['do not disturb', 'banners', 'lock screen', 'apps'])
	],
	[
		page('keyboard', 'Keyboard', 'input-keyboard-symbolic', ['input sources', 'layout', 'shortcuts', 'repeat', 'language', 'copilot key']),
		page('mouse', 'Mouse & Touchpad', 'input-mouse-symbolic', ['mouse', 'pointer', 'speed', 'scroll', 'natural scrolling', 'scrolling speed', 'scroll speed', 'tap to click', 'touchpad']),
		page('accessibility', 'Accessibility', 'preferences-desktop-accessibility-symbolic', ['a11y', 'universal access', 'screen reader', 'orca', 'zoom', 'magnifier', 'large text', 'high contrast', 'contrast', 'reduce animations', 'reduce motion', 'cursor size', 'on-screen keyboard', 'screen keyboard', 'sticky keys', 'slow keys', 'bounce keys', 'mouse keys', 'dwell click', 'hover click', 'right-click', 'locate pointer', 'find pointer', 'visual alerts', 'flash', 'hearing', 'vision'])
	],
	[
		page('apps', 'Apps', 'view-app-grid-symbolic', ['default apps', 'browser', 'startup', 'autostart']),
		page('privacy', 'Privacy', 'preferences-system-privacy-symbolic', ['screen lock', 'location', 'camera', 'microphone', 'recent files', 'file history', 'trash', 'temporary files']),
		page('security', 'Security', 'security-high-symbolic', ['secure boot', 'tpm', 'encryption', 'disk encryption', 'bitlocker', 'luks', 'recovery key', 'pin', 'firmware', 'hardware security', 'signing key', 'usb', 'passwords', 'keyring', 'passkeys'])
	],
	[
		page('datetime', 'Date & Time', 'preferences-system-time-symbolic', ['time zone', 'clock', '24-hour', 'automatic']),
		page('users', 'Users', 'system-users-symbolic', ['account', 'name', 'picture', 'avatar', 'password', 'fingerprint']),
		page('accounts', 'Accounts', 'folder-remote-symbolic', ['online accounts', 'cloud', 'icloud', 'icloud drive', 'apple', 'onedrive', 'microsoft', 'dropbox', 'nextcloud', 'webdav', 'sync', 'files on demand', 'sign in']),
		page('login', 'Login Screen', 'system-lock-screen-symbolic', ['greeter', 'sign in', 'automatic login', 'autologin', 'session', 'wallpaper', 'users', 'lock screen', 'hidden users']),
		page('updates', 'Updates', 'software-update-available-symbolic', ['software updates', 'system updates', 'upgrade', 'firmware', 'kernel', 'restart and install', 'packages', 'automatic updates', 'security updates']),
		page('about', 'About', 'help-about-symbolic', ['device name', 'system', 'hardware', 'memory', 'processor', 'graphics', 'storage'])
	]
];

export const SUBPAGES: Page<SubpageId>[] = [
	page('appearance/taskbar', 'Taskbar', 'user-desktop-symbolic', ['panel', 'dock', 'auto-hide', 'hide automatically', 'floating', 'transparent', 'pinned apps', 'alignment', 'start button', 'displays', 'workspace', 'desktop', 'virtual desktop']),
	page('appearance/fonts', 'Fonts', 'preferences-desktop-font-symbolic', ['all fonts', 'typefaces', 'font families', 'install fonts', 'remove fonts']),
	page('appearance/cursors', 'Cursor themes', 'input-mouse-symbolic', ['cursors', 'pointer', 'mouse pointer', 'get more cursors']),
	page('keyboard/dictation', 'Dictation', 'audio-input-microphone-symbolic', ['speech', 'voice typing', 'speech to text', 'talk', 'copilot key', 'microphone', 'parakeet', 'whisper', 'speech models']),
	page('accounts/add', 'Add an account', 'list-add-symbolic', ['sign in', 'online accounts', 'icloud', 'onedrive', 'dropbox', 'nextcloud', 'webdav'])
];

export const PAGES: Page[] = [...PANEL_PAGES.flat(), ...SUBPAGES];
