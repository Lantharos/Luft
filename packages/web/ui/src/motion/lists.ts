import { cubicBezier, Role } from '@luft/motion';
import { flip } from 'svelte/animate';
import type { Attachment } from 'svelte/attachments';
import { motionPreference } from './preference';

interface Place {
	top: number;
	left: number;
	width: number;
	height: number;
}

const MOST_ARRIVALS = 8;
const AWAY = '0.98';

const settle = cubicBezier(Role.move.curve);

export function reorder(node: Element, rects: { from: DOMRect; to: DOMRect }) {
	return flip(node, rects, { duration: motionPreference() === 'full' ? Role.move.duration : 0, easing: settle });
}

const placeOf = (row: HTMLElement): Place => ({ top: row.offsetTop, left: row.offsetLeft, width: row.offsetWidth, height: row.offsetHeight });

function depart(list: HTMLElement, row: HTMLElement, place: Place, full: boolean) {
	row.inert = true;
	Object.assign(row.style, { position: 'absolute', top: `${place.top}px`, left: `${place.left}px`, width: `${place.width}px`, height: `${place.height}px` });
	list.append(row);
	const frames = full ? { opacity: [1, 0], scale: ['1', AWAY] } : { opacity: [1, 0] };
	void row.animate(frames, { duration: Role.leave.duration, easing: Role.leave.easing, fill: 'forwards' }).finished.then(() => row.remove());
}

function arrive(row: HTMLElement, full: boolean) {
	const frames = full ? { opacity: [0, 1], scale: [AWAY, '1'] } : { opacity: [0, 1] };
	row.animate(frames, { duration: Role.reveal.duration, easing: Role.reveal.easing, fill: 'backwards' });
}

function move(row: HTMLElement, from: Place, to: Place) {
	const dx = from.left - to.left;
	const dy = from.top - to.top;
	if (dx || dy) row.animate({ translate: [`${dx}px ${dy}px`, '0 0'] }, { duration: Role.move.duration, easing: Role.move.easing });
}

export const listMotion: Attachment<HTMLElement> = (list) => {
	const ghosts = new WeakSet<Node>();
	let places = new Map<HTMLElement, Place>();
	const rows = () => [...list.children].filter((child): child is HTMLElement => child instanceof HTMLElement && !ghosts.has(child));

	const record = () => {
		const now = new Map(rows().map((row) => [row, placeOf(row)]));
		places.forEach((_, row) => now.has(row) || sizes.unobserve(row));
		now.forEach((_, row) => places.has(row) || sizes.observe(row));
		places = now;
	};
	const sizes = new ResizeObserver(record);

	const onScreen = () => {
		const top = -list.getBoundingClientRect().top;
		return (place: Place) => place.top + place.height > top && place.top < top + innerHeight;
	};

	const animate = (records: MutationRecord[], full: boolean) => {
		const shown = onScreen();
		const current = rows();
		const removed = records.flatMap((change) => [...change.removedNodes]);
		for (const row of removed) {
			const place = row instanceof HTMLElement && !row.isConnected ? places.get(row) : undefined;
			if (!place || !shown(place)) continue;
			ghosts.add(row);
			depart(list, row as HTMLElement, place, full);
		}
		const arrivals = current.filter((row) => !places.has(row));
		if (arrivals.length <= MOST_ARRIVALS) arrivals.filter((row) => shown(placeOf(row))).forEach((row) => arrive(row, full));
		if (!full) return;
		for (const row of current) {
			const from = places.get(row);
			const to = from && placeOf(row);
			if (from && to && (shown(from) || shown(to))) move(row, from, to);
		}
	};

	const mutations = new MutationObserver((records) => {
		const ours = records.every((change) => [...change.addedNodes, ...change.removedNodes].every((node) => ghosts.has(node)));
		if (ours) return;
		const preference = motionPreference();
		if (preference !== 'off') animate(records, preference === 'full');
		record();
	});

	sizes.observe(list);
	record();
	mutations.observe(list, { childList: true });

	return () => {
		mutations.disconnect();
		sizes.disconnect();
	};
};
