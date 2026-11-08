import { StrokeBuilder, type Feel, type Pen } from '#lib/ink/builder.js';
import { EraseGesture, type EraseMode } from '#lib/ink/eraser.js';
import { STEADY } from '#lib/ink/pressure.js';
import type { PageDocument } from '#lib/page/document.js';
import { inkColor, type Ink } from './ink-paint';
import type { PageRect } from './layout';
import type { LiveInk } from './live';
import type { Viewport } from './viewport.svelte';

export interface Target {
	page: PageRect;
	document: PageDocument;
	ink: Ink;
}

type Sample = Pick<PointerEvent, 'clientX' | 'clientY' | 'pressure' | 'timeStamp' | 'pointerType'>;

export interface Origin {
	left: number;
	top: number;
}

export function pagePoint(viewport: Viewport, origin: Origin, page: PageRect, event: Sample): [number, number] {
	const [x, y] = viewport.toContent(event.clientX - origin.left, event.clientY - origin.top);
	return [x - page.left, y - page.top];
}

const pressureOf = (event: Sample) => (event.pointerType === 'pen' && event.pressure > 0 ? event.pressure : STEADY);

/** A stroke from pen down to pen up, drawn live and committed to its page at the end. */
export class Drawing {
	private readonly builder: StrokeBuilder;

	constructor(
		private readonly viewport: Viewport,
		private readonly origin: Origin,
		private readonly target: Target,
		private readonly live: LiveInk,
		pen: Pen,
		feel: Feel,
		private readonly predicting: boolean,
		first: PointerEvent
	) {
		this.builder = new StrokeBuilder(pen, feel, first.timeStamp);
		const { zoom } = viewport;
		const [left, top] = viewport.toView(target.page.left, target.page.top);
		live.begin({ zoom, left, top, width: target.page.width, height: target.page.height }, inkColor(pen.color, target.ink), pen.tool);
		this.add([first]);
	}

	add(samples: Sample[]) {
		const from = this.builder.count;
		for (const sample of samples) {
			const [x, y] = pagePoint(this.viewport, this.origin, this.target.page, sample);
			this.builder.add(x, y, pressureOf(sample), sample.timeStamp);
		}
		if (this.builder.count > from) this.live.draw(this.builder.points.subarray(0, this.builder.length), from);
	}

	predict(predicted: Sample[]) {
		if (!this.predicting || !this.builder.count) return;
		const ahead = predicted.map((sample): [number, number, number] => [...pagePoint(this.viewport, this.origin, this.target.page, sample), pressureOf(sample)]);
		this.live.predict(this.builder.prediction(ahead));
	}

	end() {
		const from = this.builder.count;
		if (this.builder.finish()) this.live.draw(this.builder.points.subarray(0, this.builder.length), from);
		const stroke = this.builder.build(this.target.document.lastOrder + 1);
		this.target.document.commit({ removed: [], added: [stroke] });
		this.live.end();
	}

	cancel() {
		this.live.end();
	}
}

export class Erasing {
	private readonly gesture: EraseGesture;

	constructor(
		private readonly viewport: Viewport,
		private readonly origin: Origin,
		private readonly target: Target,
		mode: EraseMode,
		radius: number,
		first: PointerEvent
	) {
		this.gesture = new EraseGesture(target.document, mode, radius / viewport.zoom);
		this.move([first]);
	}

	move(samples: Sample[]) {
		for (const sample of samples) this.gesture.moveTo(...pagePoint(this.viewport, this.origin, this.target.page, sample));
	}

	end() {
		this.target.document.record(this.gesture.finish());
	}

	cancel() {
		this.end();
	}
}
