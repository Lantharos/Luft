import type { Component } from 'svelte';
import Accessibility from '@lucide/svelte/icons/accessibility';
import Bell from '@lucide/svelte/icons/bell';
import BatteryCharging from '@lucide/svelte/icons/battery-charging';
import Bluetooth from '@lucide/svelte/icons/bluetooth';
import CalendarClock from '@lucide/svelte/icons/calendar-clock';
import Cloud from '@lucide/svelte/icons/cloud';
import Info from '@lucide/svelte/icons/info';
import Keyboard from '@lucide/svelte/icons/keyboard';
import LayoutGrid from '@lucide/svelte/icons/layout-grid';
import LogIn from '@lucide/svelte/icons/log-in';
import Mic from '@lucide/svelte/icons/mic';
import Monitor from '@lucide/svelte/icons/monitor';
import Mouse from '@lucide/svelte/icons/mouse';
import Palette from '@lucide/svelte/icons/palette';
import PanelBottom from '@lucide/svelte/icons/panel-bottom';
import RefreshCw from '@lucide/svelte/icons/refresh-cw';
import Hand from '@lucide/svelte/icons/hand';
import ShieldCheck from '@lucide/svelte/icons/shield-check';
import UserRound from '@lucide/svelte/icons/user-round';
import Volume2 from '@lucide/svelte/icons/volume-2';
import Wifi from '@lucide/svelte/icons/wifi';
import MousePointer2 from '@lucide/svelte/icons/mouse-pointer-2';
import Plus from '@lucide/svelte/icons/plus';
import Type from '@lucide/svelte/icons/type';
import type { Hardware } from '#lib/state/hardware.svelte.js';
import { PANEL_PAGES, SUBPAGES, type Page, type PageId, type PanelId } from './pages';

export type { PanelId };

interface Needs {
	present: (hardware: Hardware) => boolean;
	missing: string;
}

interface View {
	icon: Component;
	load: () => Promise<{ default: Component }>;
	title?: (hardware: Hardware) => string;
	needs?: Needs;
}

export interface Panel extends Omit<Page, 'title'>, Omit<View, 'title'> {
	title: string | ((hardware: Hardware) => string);
}

const appearance = () => import('./personalization/appearance/AppearancePanel.svelte');
const accounts = () => import('./connections/accounts/AccountsPanel.svelte');
const keyboard = () => import('./devices/keyboard/KeyboardPanel.svelte');

const VIEWS: Record<PageId, View> = {
	network: { icon: Wifi, load: () => import('./connections/network/NetworkPanel.svelte') },
	bluetooth: {
		icon: Bluetooth,
		load: () => import('./connections/bluetooth/BluetoothPanel.svelte'),
		needs: { present: (hardware) => hardware.bluetooth, missing: 'This computer has no Bluetooth adapter' }
	},
	display: { icon: Monitor, load: () => import('./devices/display/DisplayPanel.svelte') },
	sound: { icon: Volume2, load: () => import('./devices/sound/SoundPanel.svelte') },
	power: {
		icon: BatteryCharging,
		load: () => import('./devices/power/PowerPanel.svelte'),
		title: (hardware) => (hardware.battery ? 'Power & Battery' : 'Power')
	},
	appearance: { icon: Palette, load: appearance },
	notifications: { icon: Bell, load: () => import('./personalization/notifications/NotificationsPanel.svelte') },
	keyboard: { icon: Keyboard, load: keyboard },
	mouse: {
		icon: Mouse,
		load: () => import('./devices/mouse/MousePanel.svelte'),
		title: ({ mouse, touchpad }) => (mouse && touchpad ? 'Mouse & Touchpad' : touchpad ? 'Touchpad' : 'Mouse'),
		needs: { present: (hardware) => hardware.mouse || hardware.touchpad, missing: 'No mouse or touchpad is connected' }
	},
	accessibility: { icon: Accessibility, load: () => import('./personalization/accessibility/AccessibilityPanel.svelte') },
	apps: { icon: LayoutGrid, load: () => import('./system/apps/AppsPanel.svelte') },
	privacy: { icon: Hand, load: () => import('./protection/privacy/PrivacyPanel.svelte') },
	security: { icon: ShieldCheck, load: () => import('./protection/security/SecurityPanel.svelte') },
	datetime: { icon: CalendarClock, load: () => import('./system/datetime/DateTimePanel.svelte') },
	users: { icon: UserRound, load: () => import('./system/users/UsersPanel.svelte') },
	accounts: { icon: Cloud, load: accounts },
	login: { icon: LogIn, load: () => import('./system/login/LoginPanel.svelte') },
	updates: { icon: RefreshCw, load: () => import('./system/updates/UpdatesPanel.svelte') },
	about: { icon: Info, load: () => import('./system/about/AboutPanel.svelte') },
	'appearance/taskbar': { icon: PanelBottom, load: appearance },
	'appearance/fonts': { icon: Type, load: appearance },
	'appearance/cursors': { icon: MousePointer2, load: appearance },
	'keyboard/dictation': { icon: Mic, load: keyboard },
	'accounts/add': { icon: Plus, load: accounts }
};

const panelOf = (page: Page): Panel => {
	const view = VIEWS[page.id];
	return { ...page, ...view, title: view.title ?? page.title };
};

const PANEL_GROUPS: Panel[][] = PANEL_PAGES.map((group) => group.map(panelOf));

export const PANELS = PANEL_GROUPS.flat();

const SUBPAGE_PANELS = SUBPAGES.map(panelOf);
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
	return panel ? { panel: name as PanelId, section: section || null } : null;
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
	return [...PANELS, ...SUBPAGE_PANELS].filter(
		(panel) =>
			isShown(panel, hardware) &&
			[titleOf(panel, hardware), ...panel.keywords, ...(hardware.copilotKey ? (panel.copilotKeyKeywords ?? []) : [])].some((term) =>
				term.toLowerCase().includes(needle)
			)
	);
}
