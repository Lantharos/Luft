import type { Component } from 'svelte';
import Bell from '@lucide/svelte/icons/bell';
import BellOff from '@lucide/svelte/icons/bell-off';
import CloudSun from '@lucide/svelte/icons/cloud-sun';
import Cpu from '@lucide/svelte/icons/cpu';
import Globe from '@lucide/svelte/icons/globe';
import Lock from '@lucide/svelte/icons/lock';
import AudioLines from '@lucide/svelte/icons/audio-lines';
import Image from '@lucide/svelte/icons/image';
import Keyboard from '@lucide/svelte/icons/keyboard';
import Sparkles from '@lucide/svelte/icons/sparkles';
import MapPin from '@lucide/svelte/icons/map-pin';
import Music from '@lucide/svelte/icons/music';
import PanelBottom from '@lucide/svelte/icons/panel-bottom';
import PanelTop from '@lucide/svelte/icons/panel-top';
import Phone from '@lucide/svelte/icons/phone';
import Search from '@lucide/svelte/icons/search';
import ShieldCheck from '@lucide/svelte/icons/shield-check';
import ToggleRight from '@lucide/svelte/icons/toggle-right';
import Volume2 from '@lucide/svelte/icons/volume-2';
import type { ExtensionAccess } from '#lib/bindings.js';

export interface Ability {
	icon: Component;
	title: string;
}

const PERMISSIONS: Record<string, Ability> = {
	wallpaper: { icon: Image, title: 'Draw over the wallpaper' },
	'quick-settings': { icon: ToggleRight, title: 'Add tiles to quick settings' },
	taskbar: { icon: PanelBottom, title: 'Add buttons to the taskbar' },
	search: { icon: Search, title: 'Add results to search' },
	notifications: { icon: Bell, title: 'Send notifications' },
	weather: { icon: CloudSun, title: 'See the weather where you are' },
	location: { icon: MapPin, title: 'See roughly where you are' },
	media: { icon: Music, title: "See and control what's playing" },
	popups: { icon: PanelTop, title: 'Show panels and small windows' },
	typing: { icon: Keyboard, title: 'Type into other apps' },
	sounds: { icon: Volume2, title: 'Play sounds' },
	'audio-levels': { icon: AudioLines, title: "Follow the beat of what's playing" },
	calls: { icon: Phone, title: "Know when you're in a call" },
	'locked-sounds': { icon: Lock, title: 'Keep playing sounds while the screen is locked' },
	'input-sounds': { icon: Keyboard, title: 'Play a sound when you type and click, without seeing your keys' },
	'do-not-disturb': { icon: BellOff, title: 'Hold back notifications for a while' },
	'screen-effects': { icon: Sparkles, title: 'Draw over and change how your windows and the whole screen look' }
};

export function abilities(access: ExtensionAccess): Ability[] {
	const listed = access.permissions.map((permission) => PERMISSIONS[permission] ?? { icon: ShieldCheck, title: permission });
	if (access.network.length) listed.push({ icon: Globe, title: `Connect to ${new Intl.ListFormat('en', { type: 'conjunction' }).format(access.network)}` });
	if (access.helper) listed.push({ icon: Cpu, title: 'Runs its own program' });
	return listed.length ? listed : [{ icon: ShieldCheck, title: 'Nothing beyond the basics' }];
}
