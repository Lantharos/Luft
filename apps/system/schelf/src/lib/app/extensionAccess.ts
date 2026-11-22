import type { Component } from 'svelte';
import Bell from '@luft/symbols/icons/bell';
import BellOff from '@luft/symbols/icons/bell-off';
import Clipboard from '@luft/symbols/icons/clipboard';
import CloudSun from '@luft/symbols/icons/cloud-sun';
import Cpu from '@luft/symbols/icons/cpu';
import Globe from '@luft/symbols/icons/globe';
import Lock from '@luft/symbols/icons/lock';
import AudioLines from '@luft/symbols/icons/audio-lines';
import Image from '@luft/symbols/icons/image';
import Keyboard from '@luft/symbols/icons/keyboard';
import ListPlus from '@luft/symbols/icons/list-plus';
import Sparkles from '@luft/symbols/icons/sparkles';
import MapPin from '@luft/symbols/icons/map-pin';
import Music from '@luft/symbols/icons/music';
import PanelBottom from '@luft/symbols/icons/panel-bottom';
import PanelTop from '@luft/symbols/icons/panel-top';
import Phone from '@luft/symbols/icons/phone';
import RadioTower from '@luft/symbols/icons/radio-tower';
import Search from '@luft/symbols/icons/search';
import ShieldCheck from '@luft/symbols/icons/shield-check';
import ToggleRight from '@luft/symbols/icons/toggle-right';
import Volume2 from '@luft/symbols/icons/volume-2';
import { i18n, t } from '@luft/i18n';
import type { ExtensionAccess } from '#lib/bindings.js';

export interface Ability {
	icon: Component;
	title: string;
}

const PERMISSIONS: Record<string, { icon: Component; id: string }> = {
	wallpaper: { icon: Image, id: 'extension-access-wallpaper' },
	'quick-settings': { icon: ToggleRight, id: 'extension-access-quick-settings' },
	taskbar: { icon: PanelBottom, id: 'extension-access-taskbar' },
	search: { icon: Search, id: 'extension-access-search' },
	notifications: { icon: Bell, id: 'extension-access-notifications' },
	weather: { icon: CloudSun, id: 'extension-access-weather' },
	location: { icon: MapPin, id: 'extension-access-location' },
	media: { icon: Music, id: 'extension-access-media' },
	popups: { icon: PanelTop, id: 'extension-access-popups' },
	typing: { icon: Keyboard, id: 'extension-access-typing' },
	sounds: { icon: Volume2, id: 'extension-access-sounds' },
	'audio-levels': { icon: AudioLines, id: 'extension-access-audio-levels' },
	calls: { icon: Phone, id: 'extension-access-calls' },
	'locked-sounds': { icon: Lock, id: 'extension-access-locked-sounds' },
	'input-sounds': { icon: Keyboard, id: 'extension-access-input-sounds' },
	'do-not-disturb': { icon: BellOff, id: 'extension-access-do-not-disturb' },
	'screen-effects': { icon: Sparkles, id: 'extension-access-screen-effects' },
	clipboard: { icon: Clipboard, id: 'extension-access-clipboard' },
	'file-actions': { icon: ListPlus, id: 'extension-access-file-actions' }
};

const list = (items: string[]) => new Intl.ListFormat(i18n.formats, { type: 'conjunction' }).format(items);

export function abilities(access: ExtensionAccess): Ability[] {
	const listed = access.permissions.map((permission) => {
		const known = PERMISSIONS[permission];
		return known ? { icon: known.icon, title: t(known.id) } : { icon: ShieldCheck, title: permission };
	});
	if (access.network.length) listed.push({ icon: Globe, title: t('extension-access-network', { hosts: list(access.network) }) });
	if (access.listen.length) {
		const ports = [...new Set(access.listen.map((listen) => listen.port))];
		listed.push({ icon: RadioTower, title: t('extension-access-listen', { count: ports.length, ports: list(ports.map(String)) }) });
	}
	if (access.helper) listed.push({ icon: Cpu, title: t('extension-access-helper') });
	return listed.length ? listed : [{ icon: ShieldCheck, title: t('extension-access-basics') }];
}

export const insideLuftAbilities = () => [t('extension-inside-luft-input'), t('extension-inside-luft-anything')];

export function sandboxLacks(parts: string[]): string {
	return list(parts.map((part) => (part === 'listen' ? t('extension-access-listen.needs') : PERMISSIONS[part] ? t(`${PERMISSIONS[part].id}.needs`) : part)));
}
