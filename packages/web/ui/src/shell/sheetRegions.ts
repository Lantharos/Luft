import { appWindow, region } from '@lantharos/sabine';
import type { Attachment } from 'svelte/attachments';

const WINDOW_RADIUS = 15;
const SHEET_INSET = 8;

function regions(sidebar: number) {
	const input = region.roundedRect(WINDOW_RADIUS);
	if (!sidebar) return { blur: region.empty(), opaque: region.roundedRect(WINDOW_RADIUS), input };
	const sheet = { left: sidebar, top: SHEET_INSET, right: SHEET_INSET, bottom: SHEET_INSET };
	const radius = WINDOW_RADIUS - SHEET_INSET;
	return { blur: region.aroundInset(WINDOW_RADIUS, sheet, radius), opaque: region.inset(sheet, radius), input };
}

export const sheetRegions: Attachment<HTMLElement> = (shell) => {
	let sidebar: HTMLElement | null = null;
	let reported = -1;
	const report = () => {
		const width = sidebar?.offsetWidth ?? 0;
		if (width === reported) return;
		reported = width;
		void appWindow.setRegions(regions(width));
	};
	const resizes = new ResizeObserver(report);
	const hidden = new MutationObserver(() => follow());
	const follow = () => {
		for (const aside of shell.querySelectorAll(':scope > .glass-sidebar')) hidden.observe(aside, { attributeFilter: ['inert'] });
		const next = shell.querySelector<HTMLElement>(':scope > .glass-sidebar:not([inert])');
		if (next !== sidebar) {
			if (sidebar) resizes.unobserve(sidebar);
			if (next) resizes.observe(next);
			sidebar = next;
		}
		report();
	};
	const children = new MutationObserver(follow);
	children.observe(shell, { childList: true });
	follow();
	return () => {
		children.disconnect();
		hidden.disconnect();
		resizes.disconnect();
	};
};
