import type { Component } from 'svelte';
import Bell from '@lucide/svelte/icons/bell';
import BellOff from '@lucide/svelte/icons/bell-off';
import Clipboard from '@lucide/svelte/icons/clipboard';
import CloudSun from '@lucide/svelte/icons/cloud-sun';
import Cpu from '@lucide/svelte/icons/cpu';
import Globe from '@lucide/svelte/icons/globe';
import Lock from '@lucide/svelte/icons/lock';
import AudioLines from '@lucide/svelte/icons/audio-lines';
import Image from '@lucide/svelte/icons/image';
import Keyboard from '@lucide/svelte/icons/keyboard';
import ListPlus from '@lucide/svelte/icons/list-plus';
import Sparkles from '@lucide/svelte/icons/sparkles';
import MapPin from '@lucide/svelte/icons/map-pin';
import Music from '@lucide/svelte/icons/music';
import PanelBottom from '@lucide/svelte/icons/panel-bottom';
import PanelTop from '@lucide/svelte/icons/panel-top';
import Phone from '@lucide/svelte/icons/phone';
import RadioTower from '@lucide/svelte/icons/radio-tower';
import Search from '@lucide/svelte/icons/search';
import ShieldCheck from '@lucide/svelte/icons/shield-check';
import ToggleRight from '@lucide/svelte/icons/toggle-right';
import Volume2 from '@lucide/svelte/icons/volume-2';
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
