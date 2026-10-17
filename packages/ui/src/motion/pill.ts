import type { Attachment } from 'svelte/attachments';
import { SpringValue } from './spring';

/**
 * Slides one highlight between a list's items to the one that matches
 * `selector`, instead of each item swapping its own background.
 */
export function selectionPill(selector = '[aria-current="page"]'): Attachment<HTMLElement> {
	return (list) => {
		const pill = Object.assign(document.createElement('div'), { className: 'selection-pill' });
		list.classList.add('selection-track');
		list.prepend(pill);
		const offset = new SpringValue(pill, (y) => ({ translate: `0 ${y}px` }));
		let shown = false;
		let frame = 0;

		const place = (animate: boolean) => {
			frame = 0;
			const item = list.querySelector<HTMLElement>(selector);
			pill.classList.toggle('shown', Boolean(item));
			if (!item) {
				shown = false;
				return;
			}
			const bounds = list.getBoundingClientRect();
			const box = item.getBoundingClientRect();
			const top = box.top - bounds.top + list.scrollTop;
			pill.style.left = `${box.left - bounds.left + list.scrollLeft}px`;
			pill.style.width = `${box.width}px`;
			pill.style.height = `${box.height}px`;
			if (animate && shown) void offset.to(top);
			else offset.set(top);
			shown = true;
		};

		const schedule = () => (frame ||= requestAnimationFrame(() => place(true)));
		const mutations = new MutationObserver(schedule);
		mutations.observe(list, { subtree: true, childList: true, attributes: true, attributeFilter: ['aria-current', 'class'] });
		const resizes = new ResizeObserver(() => place(false));
		resizes.observe(list);
		place(false);

		return () => {
			cancelAnimationFrame(frame);
			mutations.disconnect();
			resizes.disconnect();
			pill.remove();
			list.classList.remove('selection-track');
		};
	};
}
