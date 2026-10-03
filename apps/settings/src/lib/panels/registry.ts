import type { Component } from 'svelte';
import Accessibility from '@lucide/svelte/icons/accessibility';
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
import RefreshCw from '@lucide/svelte/icons/refresh-cw';
import Hand from '@lucide/svelte/icons/hand';
import ShieldCheck from '@lucide/svelte/icons/shield-check';
import UserRound from '@lucide/svelte/icons/user-round';
import Volume2 from '@lucide/svelte/icons/volume-2';
import Wifi from '@lucide/svelte/icons/wifi';
import type { Hardware } from '#lib/state/hardware.svelte.js';

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
	| 'login'
	| 'updates'
	| 'about';

interface Needs {
	present: (hardware: Hardware) => boolean;
	missing: string;
}

export interface Panel {
	id: PanelId;
	title: string | ((hardware: Hardware) => string);
	icon: Component;
	keywords: string[];
	load: () => Promise<{ default: Component }>;
	needs?: Needs;
}

const panel = (
	id: PanelId,
	title: Panel['title'],
	icon: Component,
	keywords: string[],
	load: Panel['load'],
	needs?: Needs
): Panel => ({ id, title, icon, keywords, load, needs });

const pointerTitle = ({ mouse, touchpad }: Hardware) => (mouse && touchpad ? 'Mouse & Touchpad' : touchpad ? 'Touchpad' : 'Mouse');

export const PANEL_GROUPS: Panel[][] = [
	[
		panel('network', 'Network', Wifi, ['wifi', 'wireless', 'ethernet', 'wired', 'vpn', 'internet', 'airplane', 'proxy', 'dns', 'ip address', 'hardware address', 'metered'], () => import('./network/NetworkPanel.svelte')),
		panel('bluetooth', 'Bluetooth', Bluetooth, ['devices', 'pair', 'headphones', 'speaker', 'visible', 'discoverable'], () => import('./bluetooth/BluetoothPanel.svelte'), {
			present: (hardware) => hardware.bluetooth,
			missing: 'This computer has no Bluetooth adapter'
		})
	],
	[
		panel('display', 'Displays', Monitor, ['monitor', 'screen', 'resolution', 'scale', 'refresh rate', 'night light', 'arrangement'], () => import('./display/DisplayPanel.svelte')),
		panel('sound', 'Sound', Volume2, ['audio', 'volume', 'speakers', 'microphone', 'output', 'input', 'alerts'], () => import('./sound/SoundPanel.svelte')),
		panel('power', (hardware) => (hardware.battery ? 'Power & Battery' : 'Power'), BatteryCharging, ['battery', 'sleep', 'suspend', 'power mode', 'screen blank', 'lid'], () => import('./power/PowerPanel.svelte'))
	],
	[
		panel('appearance', 'Appearance', Palette, ['wallpaper', 'background', 'dark', 'light', 'style', 'accent', 'app icons', 'tinted', 'cursor', 'pointer', 'mouse pointer', 'cursor size', 'text size', 'animations', 'fonts', 'typefaces', 'install fonts'], () => import('./appearance/AppearancePanel.svelte')),
		panel('notifications', 'Notifications', Bell, ['do not disturb', 'banners', 'lock screen', 'apps'], () => import('./notifications/NotificationsPanel.svelte'))
	],
	[
		panel('keyboard', 'Keyboard', Keyboard, ['input sources', 'layout', 'shortcuts', 'repeat', 'language'], () => import('./keyboard/KeyboardPanel.svelte')),
		panel('mouse', pointerTitle, Mouse, ['mouse', 'pointer', 'speed', 'scroll', 'natural scrolling', 'tap to click', 'touchpad'], () => import('./mouse/MousePanel.svelte'), {
			present: (hardware) => hardware.mouse || hardware.touchpad,
			missing: 'No mouse or touchpad is connected'
		}),
		panel('accessibility', 'Accessibility', Accessibility, ['a11y', 'universal access', 'screen reader', 'orca', 'zoom', 'magnifier', 'large text', 'high contrast', 'contrast', 'reduce animations', 'reduce motion', 'cursor size', 'on-screen keyboard', 'screen keyboard', 'sticky keys', 'slow keys', 'bounce keys', 'mouse keys', 'dwell click', 'hover click', 'right-click', 'locate pointer', 'find pointer', 'visual alerts', 'flash', 'hearing', 'vision'], () => import('./accessibility/AccessibilityPanel.svelte'))
	],
	[
		panel('apps', 'Apps', LayoutGrid, ['default apps', 'browser', 'startup', 'autostart'], () => import('./apps/AppsPanel.svelte')),
		panel('privacy', 'Privacy', Hand, ['screen lock', 'location', 'camera', 'microphone', 'recent files', 'file history', 'trash', 'temporary files'], () => import('./privacy/PrivacyPanel.svelte')),
		panel('security', 'Security', ShieldCheck, ['secure boot', 'tpm', 'encryption', 'disk encryption', 'bitlocker', 'luks', 'recovery key', 'pin', 'firmware', 'hardware security', 'signing key', 'usb', 'passwords', 'keyring', 'passkeys'], () => import('./security/SecurityPanel.svelte'))
	],
	[
		panel('datetime', 'Date & Time', CalendarClock, ['time zone', 'clock', '24-hour', 'automatic'], () => import('./datetime/DateTimePanel.svelte')),
		panel('users', 'Users', UserRound, ['account', 'name', 'picture', 'avatar', 'password', 'fingerprint'], () => import('./users/UsersPanel.svelte')),
		panel('login', 'Login Screen', LogIn, ['greeter', 'sign in', 'automatic login', 'autologin', 'session', 'wallpaper', 'users', 'lock screen', 'hidden users'], () => import('./login/LoginPanel.svelte')),
		panel('updates', 'Updates', RefreshCw, ['software updates', 'system updates', 'upgrade', 'firmware', 'kernel', 'restart and install', 'packages', 'automatic updates', 'security updates'], () => import('./updates/UpdatesPanel.svelte')),
		panel('about', 'About', Info, ['device name', 'system', 'hardware', 'memory', 'processor', 'graphics', 'storage'], () => import('./about/AboutPanel.svelte'))
	]
];

export const PANELS = PANEL_GROUPS.flat();
export const DEFAULT_PANEL: PanelId = 'network';

export interface Link {
	panel: PanelId;
	section: string | null;
}

export function resolveLink(target: string): Link | null {
	const [name, section] = target
		.replace(/^kestrel-settings:(\/\/)?/, '')
		.split(/[?#]/)[0]
		.toLowerCase()
		.split('/');
	const panel = PANELS.find((candidate) => candidate.id === name);
	return panel ? { panel: panel.id, section: section || null } : null;
}

export function titleOf(panel: Panel, hardware: Hardware) {
	return typeof panel.title === 'string' ? panel.title : panel.title(hardware);
}

export function isShown(panel: Panel, hardware: Hardware) {
	return panel.needs?.present(hardware) ?? true;
}

export function shownGroups(hardware: Hardware) {
	return PANEL_GROUPS.map((group) => group.filter((panel) => isShown(panel, hardware)));
}

export function searchPanels(query: string, hardware: Hardware): Panel[] {
	const needle = query.trim().toLowerCase();
	return PANELS.filter(
		(panel) => isShown(panel, hardware) && [titleOf(panel, hardware), ...panel.keywords].some((term) => term.toLowerCase().includes(needle))
	);
}
