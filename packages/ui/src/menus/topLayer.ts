import type { Attachment } from 'svelte/attachments';

export const topLayer: Attachment<HTMLElement> = (element) => {
	element.popover = 'manual';
	element.showPopover();
};
