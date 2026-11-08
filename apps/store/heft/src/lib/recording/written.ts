import { POINT_FIELDS } from '#lib/ink/stroke.js';
import type { PageDocument } from '#lib/page/document.js';

const REACH = 10;

/**
 * When what's at a point on a page was written: the point of ink nearest to it
 * within a few screen pixels, or the typed text under it. Null when there's
 * nothing there written at a known time.
 */
export function writtenAt(document: PageDocument, x: number, y: number, zoom: number): number | null {
	const text = document.objects.find((object) => object.typedAt && x >= object.x && x <= object.x + object.width && y >= object.y && y <= object.y + object.height);
	if (text?.typedAt) return text.typedAt;
	const reach = REACH / zoom;
	let nearest: { distance: number; time: number } | null = null;
	for (const stroke of document.strokes) {
		const { bounds } = stroke;
		if (x < bounds.left - reach || x > bounds.right + reach || y < bounds.top - reach || y > bounds.bottom + reach) continue;
		let time = stroke.started;
		for (let index = 0; index < stroke.points.length; index += POINT_FIELDS) {
			time += stroke.points[index + 4];
			const distance = Math.hypot(stroke.points[index] - x, stroke.points[index + 1] - y) - stroke.points[index + 2] / 2;
			if (distance <= reach && (!nearest || distance < nearest.distance)) nearest = { distance, time };
		}
	}
	return nearest?.time ?? null;
}
