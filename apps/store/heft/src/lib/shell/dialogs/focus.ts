import type { Attachment } from 'svelte/attachments';

/** Puts the cursor in the first text field inside, so a dialog can be typed into right away. */
export const focusField: Attachment<HTMLElement> = (element) => {
	requestAnimationFrame(() => element.querySelector('input')?.focus());
};
