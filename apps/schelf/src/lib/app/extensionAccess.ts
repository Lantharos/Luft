import type { Component } from 'svelte';
import Bell from '@lucide/svelte/icons/bell';
import CloudSun from '@lucide/svelte/icons/cloud-sun';
import Cpu from '@lucide/svelte/icons/cpu';
import Image from '@lucide/svelte/icons/image';
import MapPin from '@lucide/svelte/icons/map-pin';
import Music from '@lucide/svelte/icons/music';
import PanelBottom from '@lucide/svelte/icons/panel-bottom';
import Search from '@lucide/svelte/icons/search';
import ShieldCheck from '@lucide/svelte/icons/shield-check';
import ToggleRight from '@lucide/svelte/icons/toggle-right';
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
	media: { icon: Music, title: "See and control what's playing" }
};

export function abilities(access: ExtensionAccess): Ability[] {
	const listed = access.permissions.map((permission) => PERMISSIONS[permission] ?? { icon: ShieldCheck, title: permission });
	if (access.helper) listed.push({ icon: Cpu, title: 'Runs its own program' });
	return listed.length ? listed : [{ icon: ShieldCheck, title: 'Nothing beyond the basics' }];
}
