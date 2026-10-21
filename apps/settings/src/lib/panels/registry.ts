import type { Component } from 'svelte';
import Accessibility from '@lucide/svelte/icons/accessibility';
import AppWindow from '@lucide/svelte/icons/app-window';
import Bell from '@lucide/svelte/icons/bell';
import BatteryCharging from '@lucide/svelte/icons/battery-charging';
import Bluetooth from '@lucide/svelte/icons/bluetooth';
import EthernetPort from '@lucide/svelte/icons/ethernet-port';
import Globe from '@lucide/svelte/icons/globe';
import Hand from '@lucide/svelte/icons/hand';
import HardDrive from '@lucide/svelte/icons/hard-drive';
import Info from '@lucide/svelte/icons/info';
import Keyboard from '@lucide/svelte/icons/keyboard';
import KeyRound from '@lucide/svelte/icons/key-round';
import Languages from '@lucide/svelte/icons/languages';
import LayoutGrid from '@lucide/svelte/icons/layout-grid';
import LogIn from '@lucide/svelte/icons/log-in';
import Mic from '@lucide/svelte/icons/mic';
import Monitor from '@lucide/svelte/icons/monitor';
import MonitorCog from '@lucide/svelte/icons/monitor-cog';
import Palette from '@lucide/svelte/icons/palette';
import Plus from '@lucide/svelte/icons/plus';
import Shield from '@lucide/svelte/icons/shield';
import ShieldCheck from '@lucide/svelte/icons/shield-check';
import ShieldEllipsis from '@lucide/svelte/icons/shield-ellipsis';
import UserRound from '@lucide/svelte/icons/user-round';
import Volume2 from '@lucide/svelte/icons/volume-2';
import Wifi from '@lucide/svelte/icons/wifi';
import { t } from '@luft/i18n';
import { english } from '#lib/state/english.svelte.js';
import type { Hardware } from '#lib/state/hardware.svelte.js';
import { PANEL_PAGES, pageKeywords, SUBPAGES, type Page, type PageId, type PanelId } from '@luft/settings-pages';

export type { PanelId };

interface Needs {
	present: (hardware: Hardware) => boolean;
	missing: string;
}

interface View {
	icon: Component;
	load: () => Promise<{ default: Component }>;
	titleFor?: (hardware: Hardware) => string;
	needs?: Needs;
}

export interface Panel extends Page, View {}

const network = () => import('./connections/network/NetworkPanel.svelte');
const input = () => import('./devices/input/InputPanel.svelte');
const security = () => import('./protection/security/SecurityPanel.svelte');
const accounts = () => import('./system/accounts/AccountsPanel.svelte');
const system = () => import('./system/SystemPanel.svelte');

const VIEWS: Record<PageId, View> = {
	network: { icon: Wifi, load: network },
	bluetooth: {
		icon: Bluetooth,
		load: () => import('./connections/bluetooth/BluetoothPanel.svelte'),
		needs: { present: (hardware) => hardware.bluetooth, missing: 'settings-bluetooth-missing' }
	},
	display: { icon: Monitor, load: () => import('./devices/display/DisplayPanel.svelte') },
	sound: { icon: Volume2, load: () => import('./devices/sound/SoundPanel.svelte') },
	power: {
		icon: BatteryCharging,
		load: () => import('./devices/power/PowerPanel.svelte'),
		titleFor: (hardware) => (hardware.battery ? 'settings-page-power' : 'settings-power-title')
	},
	input: { icon: Keyboard, load: input },
	appearance: { icon: Palette, load: () => import('./personalization/appearance/AppearancePanel.svelte') },
	desktop: { icon: AppWindow, load: () => import('./personalization/desktop/DesktopPanel.svelte') },
	notifications: { icon: Bell, load: () => import('./personalization/notifications/NotificationsPanel.svelte') },
	accessibility: { icon: Accessibility, load: () => import('./personalization/accessibility/AccessibilityPanel.svelte') },
	apps: { icon: LayoutGrid, load: () => import('./protection/apps/AppsPanel.svelte') },
	privacy: { icon: Hand, load: () => import('./protection/privacy/PrivacyPanel.svelte') },
	security: { icon: ShieldCheck, load: security },
	accounts: { icon: UserRound, load: accounts },
	language: { icon: Languages, load: () => import('./system/language/LanguagePanel.svelte') },
	system: { icon: MonitorCog, load: system },
	'network/wifi': { icon: Wifi, load: network },
	'network/ethernet': { icon: EthernetPort, load: network },
	'network/vpn': { icon: Shield, load: network },
	'network/proxy': { icon: Globe, load: network },
	'input/shortcuts': { icon: Keyboard, load: input },
	'input/dictation': { icon: Mic, load: input },
	'security/protections': { icon: ShieldEllipsis, load: security },
	'security/encryption': { icon: HardDrive, load: security },
	'security/keyring': { icon: KeyRound, load: security },
	'accounts/login': { icon: LogIn, load: accounts },
	'accounts/add': { icon: Plus, load: accounts },
	'system/about': { icon: Info, load: system }
};

const GROUP_TITLES = ['settings-group-connections', 'settings-group-devices', 'settings-group-look', 'settings-group-protection', 'settings-group-system'];

const panelOf = (page: Page): Panel => ({ ...page, ...VIEWS[page.id] });

export interface Group {
	title: string;
	panels: Panel[];
}

const GROUPS: Group[] = PANEL_PAGES.map((group, index) => ({ title: GROUP_TITLES[index], panels: group.map(panelOf) }));

export const PANELS = GROUPS.flatMap((group) => group.panels);

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
	return t(panel.titleFor?.(hardware) ?? panel.title);
}

export function isShown(panel: Panel, hardware: Hardware) {
	return panel.needs?.present(hardware) ?? true;
}

export function shownGroups(hardware: Hardware): Group[] {
	return GROUPS.map((group) => ({ title: t(group.title), panels: group.panels.filter((panel) => isShown(panel, hardware)) }));
}

export function searchPanels(query: string, hardware: Hardware): Panel[] {
	const needle = query.trim().toLocaleLowerCase();
	const inEnglish = english.translate;
	return [...PANELS, ...SUBPAGE_PANELS].filter(
		(panel) =>
			isShown(panel, hardware) &&
			[titleOf(panel, hardware), ...pageKeywords(panel, hardware.copilotKey, t, inEnglish)].some((term) => term.toLocaleLowerCase().includes(needle))
	);
}
