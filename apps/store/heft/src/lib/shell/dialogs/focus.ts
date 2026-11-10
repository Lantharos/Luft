import type { Attachment } from 'svelte/attachments';

export const focusField: Attachment<HTMLElement> = (element) => {
	requestAnimationFrame(() => element.querySelector('input')?.focus());
};
