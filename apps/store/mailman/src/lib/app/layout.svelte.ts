import { appWindow, region } from '@lantharos/sabine';
import { opened } from './launch.svelte';

const FULL_SIDEBAR_FROM = 1200;
const SIDE_BY_SIDE_FROM = 960;
const SIDEBAR_WIDTH = { full: 248, rail: 72, none: 0 };
const LIST = { min: 300, share: 0.3, max: 400 };
// Kestrel rounds windows to 15px, so the regions follow it
const WINDOW_RADIUS = 15;

export type SidebarMode = keyof typeof SIDEBAR_WIDTH;

class Layout {
	width = $state(window.innerWidth);
	sidebar = $derived<SidebarMode>(opened.focused ? 'none' : this.width >= FULL_SIDEBAR_FROM ? 'full' : 'rail');
	sidebarWidth = $derived(SIDEBAR_WIDTH[this.sidebar]);
	sideBySide = $derived(this.width >= SIDE_BY_SIDE_FROM);
	listWidth = $derived(Math.round(Math.min(LIST.max, Math.max(LIST.min, (this.width - this.sidebarWidth) * LIST.share))));
}

export const layout = new Layout();

export function followSidebarRegions() {
	$effect(() => {
		const width = layout.sidebarWidth;
		void appWindow.setRegions({
			blur: width ? region.roundedLeft(width, WINDOW_RADIUS) : region.empty(),
			opaque: region.contentAfterSidebarRoundedRight(width, 0, WINDOW_RADIUS),
			input: region.roundedRect(WINDOW_RADIUS)
		});
	});
}
