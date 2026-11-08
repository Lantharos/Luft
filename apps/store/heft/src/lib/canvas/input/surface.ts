import { settings } from '#lib/app/settings.svelte.js';
import { BARREL, pen, SECOND_BARREL } from '#lib/input/pen.svelte.js';
import { tools } from '#lib/tools/tools.svelte.js';
import { addText } from '#lib/objects/editing.svelte.js';
import { Drawing, Erasing, pagePoint, type Origin, type Target } from './drawing';
import { TouchGestures } from './gestures';
import { selection } from '#lib/selection/selection.svelte.js';
import { Lassoing } from './lasso';
import { TextPicking } from './selecting';
import { pageNear } from '../layout';
import type { LiveInk } from '../live';
import { MAX_ZOOM, MIN_ZOOM, type Viewport } from '../viewport.svelte';

type Tool = 'draw' | 'highlight' | 'erase' | 'text' | 'lasso' | 'type';

const ERASER_BUTTON = 32;
const WHEEL_SETTLE = 160;
const LINE = 40;

export interface SurfaceHost {
	target(index: number): Target | null;
	preview(scale: number, x: number, y: number): void;
	undo(): void;
	redo(): void;
}

type Action = Drawing | Erasing | TextPicking | Lassoing | { pan: true; x: number; y: number };

/** Sorts pointers into writing, erasing, panning and zooming, and keeps the palm out of it. */
export class Surface {
	private readonly actions = new Map<number, Action>();
	private readonly gestures: TouchGestures;
	private origin: Origin = { left: 0, top: 0 };
	private pending = { scale: 1, x: 0, y: 0 };
	private wheelTimer = 0;
	private raw = false;

	constructor(
		private readonly element: HTMLElement,
		private readonly viewport: Viewport,
		private readonly live: LiveInk,
		private readonly host: SurfaceHost
	) {
		this.gestures = new TouchGestures(
			viewport,
			{
				undo: () => host.undo(),
				redo: () => host.redo(),
				preview: (scale, x, y) => this.preview(scale, x, y),
				settle: () => this.settle()
			},
			() => settings.values.fingerPans
		);
	}

	get writing() {
		for (const action of this.actions.values()) if (action instanceof Drawing || action instanceof Erasing) return true;
		return false;
	}

	down(event: PointerEvent) {
		event.preventDefault();
		const rect = this.element.getBoundingClientRect();
		this.origin = { left: rect.left, top: rect.top };
		if (event.pointerType === 'touch') return this.touchDown(event);
		if (event.pointerType === 'mouse' && pen.near) return;
		if (event.pointerType === 'pen') pen.seen();
		if (event.pointerType === 'mouse' && event.button === 1) {
			this.capture(event, { pan: true, x: event.clientX, y: event.clientY });
			return;
		}
		if (event.button !== 0) return;
		const action = this.begin(event, this.toolFor(event));
		if (action) this.capture(event, action);
	}

	private toolFor(event: PointerEvent): Tool | null {
		if (event.pointerType === 'pen') {
			if (event.buttons & ERASER_BUTTON || pen.tool === 'eraser') return 'erase';
			const barrel = pen.buttons & BARREL ? settings.values.barrel : pen.buttons & SECOND_BARREL ? settings.values.secondBarrel : null;
			if (barrel === 'eraser') return 'erase';
			if (barrel === 'highlighter') return 'highlight';
		}
		if (tools.active === 'eraser') return 'erase';
		return tools.active === 'draw' ? 'draw' : tools.active;
	}

	private begin(event: PointerEvent, tool: Tool | null): Action | null {
		if (!tool) return null;
		const [, contentY] = this.viewport.toContent(event.clientX - this.origin.left, event.clientY - this.origin.top);
		const index = pageNear(this.viewport.layout, contentY);
		const target = this.host.target(index);
		if (!target) return null;
		selection.clear();
		if (tool === 'type') {
			const [x, y] = pagePoint(this.viewport, this.origin, target.page, event);
			addText(target.document, x, y, target.page.width);
			return null;
		}
		if (tool === 'lasso') return new Lassoing(this.viewport, this.origin, target, this.live, event);
		if (tool === 'text') return target.pdf ? new TextPicking(this.viewport, this.origin, target, target.pdf, event) : null;
		if (tool === 'erase') return new Erasing(this.viewport, this.origin, target, tools.eraserMode, tools.eraserRadius, event);
		const preset = tool === 'highlight' ? (tools.presets.find((candidate) => candidate.tool === 'highlighter') ?? tools.preset) : tools.preset;
		const feel = { firmness: settings.values.firmness, stabilization: settings.values.stabilization };
		return new Drawing(this.viewport, this.origin, target, this.live, preset, feel, settings.values.prediction, event);
	}

	private capture(event: PointerEvent, action: Action) {
		this.element.setPointerCapture(event.pointerId);
		this.actions.set(event.pointerId, action);
	}

	move(event: PointerEvent) {
		if (event.pointerType === 'touch') {
			if (this.gestures.active) this.gestures.move(event.pointerId, event.clientX, event.clientY, event.timeStamp);
			const drawing = this.actions.get(event.pointerId);
			if (drawing instanceof Drawing) drawing.add(event.getCoalescedEvents());
			return;
		}
		if (event.pointerType === 'pen') pen.seen();
		const action = this.actions.get(event.pointerId);
		if (!action) return;
		if (action instanceof Drawing) {
			if (!this.raw) action.add(event.getCoalescedEvents());
			action.predict(event.getPredictedEvents());
		} else if (action instanceof Erasing) action.move(event.getCoalescedEvents());
		else if (action instanceof TextPicking) action.move(event);
		else if (action instanceof Lassoing) action.move(event.getCoalescedEvents());
		else {
			this.viewport.panBy(action.x - event.clientX, action.y - event.clientY);
			action.x = event.clientX;
			action.y = event.clientY;
		}
	}

	/**
	 * Pen and mouse samples as soon as they arrive, before the frame's
	 * pointermove, so the ink reaches the frame that is being drawn.
	 */
	rawUpdate(event: PointerEvent) {
		const action = this.actions.get(event.pointerId);
		if (event.pointerType === 'touch' || !(action instanceof Drawing)) return;
		this.raw = true;
		const samples = event.getCoalescedEvents();
		action.add(samples.length ? samples : [event]);
	}

	up(event: PointerEvent) {
		if (event.pointerType === 'touch') this.gestures.up(event.pointerId, event.timeStamp);
		const action = this.actions.get(event.pointerId);
		this.actions.delete(event.pointerId);
		if (action instanceof Drawing || action instanceof Erasing || action instanceof TextPicking || action instanceof Lassoing) action.end();
	}

	cancel(event: PointerEvent) {
		if (event.pointerType === 'touch') this.gestures.up(event.pointerId, event.timeStamp);
		const action = this.actions.get(event.pointerId);
		this.actions.delete(event.pointerId);
		if (action instanceof Drawing || action instanceof Erasing || action instanceof Lassoing) action.cancel();
	}

	private touchDown(event: PointerEvent) {
		if (pen.palmLikely || this.writing) {
			this.gestures.cancel();
			return;
		}
		this.element.setPointerCapture(event.pointerId);
		if (settings.values.touchDraws && !this.gestures.active) {
			const action = this.begin(event, this.toolFor(event));
			if (action) {
				this.actions.set(event.pointerId, action);
				return;
			}
		}
		for (const [id, action] of this.actions) {
			if (action instanceof Drawing) {
				action.cancel();
				this.actions.delete(id);
			}
		}
		this.gestures.down(event.pointerId, event.clientX, event.clientY, event.timeStamp);
	}

	wheel(event: WheelEvent) {
		event.preventDefault();
		const scale = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? LINE : 1;
		if (!event.ctrlKey) {
			const [dx, dy] = event.shiftKey ? [event.deltaY, event.deltaX] : [event.deltaX, event.deltaY];
			this.viewport.panBy(dx * scale, dy * scale);
			return;
		}
		const x = event.clientX - this.element.getBoundingClientRect().left;
		const y = event.clientY - this.element.getBoundingClientRect().top;
		const factor = Math.exp(-event.deltaY * scale * 0.0022);
		const { scale: current, x: tx, y: ty } = this.pending;
		const next = this.clampScale(current * factor);
		const applied = next / current;
		this.preview(next, x - (x - tx) * applied, y - (y - ty) * applied);
		clearTimeout(this.wheelTimer);
		this.wheelTimer = window.setTimeout(() => this.settle(), WHEEL_SETTLE);
	}

	private clampScale(scale: number) {
		return Math.min(MAX_ZOOM / this.viewport.zoom, Math.max(MIN_ZOOM / this.viewport.zoom, scale));
	}

	private preview(scale: number, x: number, y: number) {
		const clamped = this.clampScale(scale);
		this.pending = { scale: clamped, x, y };
		this.host.preview(clamped, x, y);
	}

	private settle() {
		const { scale, x, y } = this.pending;
		this.pending = { scale: 1, x: 0, y: 0 };
		this.host.preview(1, 0, 0);
		if (scale === 1 && x === 0 && y === 0) return;
		this.viewport.zoom *= scale;
		this.viewport.x = this.viewport.x * scale - x;
		this.viewport.y = this.viewport.y * scale - y;
		this.viewport.clamp();
	}
}
