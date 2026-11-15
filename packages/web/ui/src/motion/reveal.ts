import { Feedback, Role } from '@luft/motion';
import type { Attachment } from 'svelte/attachments';
import { motionPreference } from './preference';

const RISE = 4;

export const revealContents: Attachment<HTMLElement> = (container) => {
	if (motionPreference() !== 'full') return;
	const items = [...container.children].filter((item) => item instanceof HTMLElement);
	items.forEach((item, index) =>
		item.animate(
			{ opacity: [0, 1], translate: [`0 ${RISE}px`, '0 0'] },
			{
				duration: Role.reveal.duration,
				delay: Feedback.staggerAfter + Math.min(index, Feedback.staggerMost) * Feedback.staggerStep,
				easing: Role.reveal.easing,
				fill: 'backwards'
			}
		)
	);
};
