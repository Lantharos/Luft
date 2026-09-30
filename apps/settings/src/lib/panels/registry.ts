import type { Component } from 'svelte';
import Bell from '@lucide/svelte/icons/bell';
import BatteryCharging from '@lucide/svelte/icons/battery-charging';
import Bluetooth from '@lucide/svelte/icons/bluetooth';
import CalendarClock from '@lucide/svelte/icons/calendar-clock';
import Info from '@lucide/svelte/icons/info';
import Keyboard from '@lucide/svelte/icons/keyboard';
import LayoutGrid from '@lucide/svelte/icons/layout-grid';
import LogIn from '@lucide/svelte/icons/log-in';
import Monitor from '@lucide/svelte/icons/monitor';
import Mouse from '@lucide/svelte/icons/mouse';
import Palette from '@lucide/svelte/icons/palette';
import Shield from '@lucide/svelte/icons/shield';
import UserRound from '@lucide/svelte/icons/user-round';
import Volume2 from '@lucide/svelte/icons/volume-2';
import Wifi from '@lucide/svelte/icons/wifi';

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
	| 'apps'
	| 'privacy'
	| 'datetime'
	| 'users'
	| 'login'
	| 'about';

export interface Panel {
	id: PanelId;
	title: string;
	icon: Component;
	keywords: string[];
	load: () => Promise<{ default: Component }>;
}

const panel = (
	id: PanelId,
	title: string,
	icon: Component,
	keywords: string[],
	load: Panel['load']
): Panel => ({ id, title, icon, keywords, load });

export const PANEL_GROUPS: Panel[][] = [
	[
		panel('network', 'Network', Wifi, ['wifi', 'wireless', 'ethernet', 'wired', 'vpn', 'internet', 'airplane', 'proxy', 'dns', 'ip address', 'hardware address', 'metered'], () => import('./network/NetworkPanel.svelte')),
		panel('bluetooth', 'Bluetooth', Bluetooth, ['devices', 'pair', 'headphones', 'speaker', 'visible', 'discoverable'], () => import('./bluetooth/BluetoothPanel.svelte'))
	],
	[
		panel('display', 'Displays', Monitor, ['monitor', 'screen', 'resolution', 'scale', 'refresh rate', 'night light', 'arrangement'], () => import('./display/DisplayPanel.svelte')),
		panel('sound', 'Sound', Volume2, ['audio', 'volume', 'speakers', 'microphone', 'output', 'input', 'alerts'], () => import('./sound/SoundPanel.svelte')),
		panel('power', 'Power & Battery', BatteryCharging, ['battery', 'sleep', 'suspend', 'power mode', 'screen blank', 'lid'], () => import('./power/PowerPanel.svelte'))
	],
	[
		panel('appearance', 'Appearance', Palette, ['wallpaper', 'background', 'dark', 'light', 'style', 'accent', 'text size', 'animations'], () => import('./appearance/AppearancePanel.svelte')),
		panel('notifications', 'Notifications', Bell, ['do not disturb', 'banners', 'lock screen', 'apps'], () => import('./notifications/NotificationsPanel.svelte'))
	],
	[
		panel('keyboard', 'Keyboard', Keyboard, ['input sources', 'layout', 'shortcuts', 'repeat', 'language'], () => import('./keyboard/KeyboardPanel.svelte')),
		panel('mouse', 'Mouse & Touchpad', Mouse, ['pointer', 'speed', 'scroll', 'natural scrolling', 'tap to click', 'touchpad'], () => import('./mouse/MousePanel.svelte'))
	],
	[
		panel('apps', 'Apps', LayoutGrid, ['default apps', 'browser', 'startup', 'autostart'], () => import('./apps/AppsPanel.svelte')),
		panel('privacy', 'Privacy & Security', Shield, ['screen lock', 'location', 'camera', 'microphone', 'recent files', 'trash'], () => import('./privacy/PrivacyPanel.svelte'))
	],
	[
		panel('datetime', 'Date & Time', CalendarClock, ['time zone', 'clock', '24-hour', 'automatic'], () => import('./datetime/DateTimePanel.svelte')),
		panel('users', 'Users', UserRound, ['account', 'name', 'picture', 'avatar', 'password', 'fingerprint'], () => import('./users/UsersPanel.svelte')),
		panel('login', 'Login Screen', LogIn, ['greeter', 'sign in', 'automatic login', 'autologin', 'session', 'wallpaper', 'users', 'lock screen', 'hidden users'], () => import('./login/LoginPanel.svelte')),
		panel('about', 'About', Info, ['device name', 'system', 'hardware', 'memory', 'processor', 'graphics', 'storage'], () => import('./about/AboutPanel.svelte'))
	]
];

export const PANELS = PANEL_GROUPS.flat();
export const DEFAULT_PANEL: PanelId = 'network';

export function resolvePanel(target: string): PanelId | null {
	const name = target.replace(/^kestrel-settings:(\/\/)?/, '').split(/[/?#]/)[0].toLowerCase();
	return PANELS.find((panel) => panel.id === name)?.id ?? null;
}

export function searchPanels(query: string): Panel[] {
	const needle = query.trim().toLowerCase();
	if (!needle) return PANELS;
	return PANELS.filter((panel) => [panel.title, ...panel.keywords].some((term) => term.toLowerCase().includes(needle)));
}
