import type { Component } from 'svelte';
import Accessibility from '@luft/symbols/icons/accessibility';
import AppWindow from '@luft/symbols/icons/app-window';
import AudioLines from '@luft/symbols/icons/audio-lines';
import BatteryCharging from '@luft/symbols/icons/battery-charging';
import Bluetooth from '@luft/symbols/icons/bluetooth';
import BrickWallShield from '@luft/symbols/icons/brick-wall-shield';
import EthernetPort from '@luft/symbols/icons/ethernet-port';
import Globe from '@luft/symbols/icons/globe';
import Hand from '@luft/symbols/icons/hand';
import HardDrive from '@luft/symbols/icons/hard-drive';
import Info from '@luft/symbols/icons/info';
import Keyboard from '@luft/symbols/icons/keyboard';
import KeyRound from '@luft/symbols/icons/key-round';
import Languages from '@luft/symbols/icons/languages';
import LayoutGrid from '@luft/symbols/icons/layout-grid';
import LogIn from '@luft/symbols/icons/log-in';
import Mic from '@luft/symbols/icons/mic';
import Monitor from '@luft/symbols/icons/monitor';
import MonitorCog from '@luft/symbols/icons/monitor-cog';
import Palette from '@luft/symbols/icons/palette';
import PenLine from '@luft/symbols/icons/pen-line';
import PanelBottom from '@luft/symbols/icons/panel-bottom';
import Printer from '@luft/symbols/icons/printer';
import Plus from '@luft/symbols/icons/plus';
import Puzzle from '@luft/symbols/icons/puzzle';
import Send from '@luft/symbols/icons/send';
import Shield from '@luft/symbols/icons/shield';
import MonitorUp from '@luft/symbols/icons/monitor-up';
import ShieldCheck from '@luft/symbols/icons/shield-check';
import SquareTerminal from '@luft/symbols/icons/square-terminal';
import UserRound from '@luft/symbols/icons/user-round';
import Volume2 from '@luft/symbols/icons/volume-2';
import Wifi from '@luft/symbols/icons/wifi';
import { t } from '@luft/i18n';
import type { Hardware } from '#lib/bindings.js';
import { english } from '#lib/state/english.svelte.js';
import { PANEL_PAGES, pageKeywords, SUBPAGES, type Page, type PageId, type PanelId } from '@luft/settings-pages';
import { ROWS } from 'virtual:settings-rows';

export type { PanelId };

interface Needs {
	present: (hardware: Hardware) => boolean;
	missing: string;
}

interface View {
	icon: Component;
	load: () => Promise<{ default: Component }>;
	titleFor?: (hardware: Hardware) => string;
	iconFor?: (hardware: Hardware) => Component;
	needs?: Needs;
}

export interface Panel extends Page, View {}

const network = () => import('./connections/network/NetworkPanel.svelte');
const input = () => import('./devices/input/InputPanel.svelte');
const sound = () => import('./devices/sound/SoundPanel.svelte');
const privacy = () => import('./protection/privacy/PrivacyPanel.svelte');
const security = () => import('./protection/security/SecurityPanel.svelte');
const accounts = () => import('./system/accounts/AccountsPanel.svelte');
const system = () => import('./system/SystemPanel.svelte');

const VIEWS: Record<PageId, View> = {
	network: { icon: Wifi, iconFor: (hardware) => (hardware.wifi ? Wifi : EthernetPort), load: network },
	bluetooth: {
		icon: Bluetooth,
		load: () => import('./connections/bluetooth/BluetoothPanel.svelte'),
		needs: { present: (hardware) => hardware.bluetooth, missing: 'settings-bluetooth-missing' }
	},
	post: { icon: Send, load: () => import('./connections/post/PostPanel.svelte') },
	display: { icon: Monitor, load: () => import('./devices/display/DisplayPanel.svelte') },
	sound: { icon: Volume2, load: sound },
	power: {
		icon: BatteryCharging,
		load: () => import('./devices/power/PowerPanel.svelte'),
		titleFor: (hardware) => (hardware.battery ? 'settings-page-power' : 'settings-power-title')
	},
	input: { icon: Keyboard, load: input },
	pen: {
		icon: PenLine,
		load: () => import('./devices/pen/PenPanel.svelte'),
		needs: { present: (hardware) => hardware.pen, missing: 'settings-pen-missing' }
	},
	printers: { icon: Printer, load: () => import('./devices/printers/PrintersPanel.svelte') },
	appearance: { icon: Palette, load: () => import('./personalization/appearance/AppearancePanel.svelte') },
	taskbar: { icon: PanelBottom, load: () => import('./personalization/taskbar/TaskbarPanel.svelte') },
	windows: { icon: AppWindow, load: () => import('./personalization/windows/WindowsPanel.svelte') },
	extensions: { icon: Puzzle, load: () => import('./personalization/extensions/ExtensionsPanel.svelte') },
	accessibility: { icon: Accessibility, load: () => import('./personalization/accessibility/AccessibilityPanel.svelte') },
	apps: { icon: LayoutGrid, load: () => import('./system/apps/AppsPanel.svelte') },
	privacy: { icon: Hand, load: privacy },
	security: { icon: ShieldCheck, load: security },
	accounts: { icon: UserRound, load: accounts },
	language: { icon: Languages, load: () => import('./system/language/LanguagePanel.svelte') },
	system: { icon: MonitorCog, load: system },
	'network/wifi': { icon: Wifi, load: network },
	'network/ethernet': { icon: EthernetPort, load: network },
	'network/vpn': { icon: Shield, load: network },
	'network/firewall': { icon: BrickWallShield, load: network },
	'network/proxy': { icon: Globe, load: network },
	'sound/custom': { icon: AudioLines, load: sound },
	'input/shortcuts': { icon: Keyboard, load: input },
	'input/dictation': { icon: Mic, load: input },
	'privacy/sharing': { icon: MonitorUp, load: privacy },
	'security/encryption': { icon: HardDrive, load: security },
	'security/keyring': { icon: KeyRound, load: security },
	'security/remote-login': { icon: SquareTerminal, load: security },
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
	const [name, ...section] = target
		.replace(/^kestrel-settings:(\/\/)?/, '')
		.split(/[?#]/)[0]
		.toLowerCase()
		.split('/');
	const panel = PANELS.find((candidate) => candidate.id === name);
	return panel ? { panel: name as PanelId, section: section.join('/') || null } : null;
}

export function titleOf(panel: Panel, hardware: Hardware) {
	return t(panel.titleFor?.(hardware) ?? panel.title);
}

export function iconOf(panel: Panel, hardware: Hardware) {
	return panel.iconFor?.(hardware) ?? panel.icon;
}

export function isShown(panel: Panel, hardware: Hardware) {
	return panel.needs?.present(hardware) ?? true;
}

export function shownGroups(hardware: Hardware): Group[] {
	return GROUPS.map((group) => ({ title: t(group.title), panels: group.panels.filter((panel) => isShown(panel, hardware)) }));
}

export interface Found {
	panel: Panel;
	setting: string | null;
}

const ALL_PANELS = [...PANELS, ...SUBPAGE_PANELS];

const shownPage = (panel: Panel, hardware: Hardware) => isShown(PANELS.find((parent) => parent.id === panel.id.split('/')[0])!, hardware);

export function search(query: string, hardware: Hardware): Found[] {
	const needle = query.trim().toLocaleLowerCase();
	const inEnglish = english.translate;
	const matches = (term: string) => term.toLocaleLowerCase().includes(needle);
	const pages = ALL_PANELS.filter(
		(panel) => shownPage(panel, hardware) && [titleOf(panel, hardware), ...pageKeywords(panel, hardware.copilotKey, t, inEnglish)].some(matches)
	).map((panel) => ({ panel, setting: null }));
	const seen = new Set<string>();
	const settings = ROWS.flatMap((row) => {
		const panel = ALL_PANELS.find((candidate) => candidate.id === row.page)!;
		const setting = t(row.title);
		const found = shownPage(panel, hardware) && (matches(setting) || Boolean(inEnglish && matches(inEnglish(row.title))));
		const key = `${panel.id} ${setting}`;
		if (!found || seen.has(key) || setting === titleOf(panel, hardware)) return [];
		seen.add(key);
		return [{ panel, setting }];
	});
	return [...pages, ...settings];
}
