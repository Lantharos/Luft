import type { ImageDocument } from '#lib/document/image.svelte.js';
import type { ToolEvent } from '#lib/tools/tool.js';

const REACH_PX = 7;

function nearest(value: number, targets: number[], reach: number) {
	let best = value;
	let distance = reach;
	for (const target of targets) {
		const away = Math.abs(target - value);
		if (away < distance) {
			distance = away;
			best = target;
		}
	}
	return best;
}

export function snapEvent(doc: ImageDocument, scale: number, event: ToolEvent): ToolEvent {
	const reach = REACH_PX / scale;
	const xs = [0, doc.width / 2, doc.width, ...doc.guides.filter((guide) => guide.axis === 'x').map((guide) => guide.at)];
	const ys = [0, doc.height / 2, doc.height, ...doc.guides.filter((guide) => guide.axis === 'y').map((guide) => guide.at)];
	const x = nearest(event.x, xs, reach);
	const y = nearest(event.y, ys, reach);
	return { ...event, x, y, samples: event.samples.map((sample) => ({ ...sample, x: nearest(sample.x, xs, reach), y: nearest(sample.y, ys, reach) })) };
}
