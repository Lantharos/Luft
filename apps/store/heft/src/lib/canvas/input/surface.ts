import { settings } from '#lib/app/settings.svelte.js';
import type { Stroke } from '#lib/ink/stroke.js';
import { activity } from '#lib/input/activity.js';
import { editing } from '#lib/objects/editing.svelte.js';
import { pen } from '#lib/input/pen.svelte.js';
import { tools } from '#lib/tools/tools.svelte.js';
import { Drawing, Erasing, pagePoint, type Origin, type Target } from './drawing';
import { TouchGestures } from './gestures';
import { selection } from '#lib/selection/selection.svelte.js';
import { TextCarrying } from './carrying';
import { Lassoing } from './lasso';
import { textSelection } from '#lib/pdf/selection.svelte.js';
import { TextPicking } from './selecting';
import { pageNear } from '../layout';
import type { LiveInk } from '../live';
import type { Ruler } from '../ruler/ruler.svelte';
import { MAX_ZOOM, MIN_ZOOM, type Viewport } from '../viewport.svelte';

type Tool = 'draw' | 'highlight' | 'erase' | 'text' | 'lasso' | 'type';

const ERASER_BUTTON = 32;
const WHEEL_SETTLE = 160;
const LINE = 40;
const TAP_SLOP = 4;
const TAP_TIME = 350;

export interface SurfaceHost {
	target(index: number): Target | null;
	preview(scale: number, x: number, y: number): void;
	ruler(): Ruler;
	typeAt(target: Target, x: number, y: number, client: [number, number]): void;
	aim(target: Target, x: number, y: number): void;
	wrote(target: Target, stroke: Stroke): void;
	undo(): void;
	redo(): void;
	tapped(index: number, x: number, y: number): boolean;
}

function stopTyping() {
	const active = document.activeElement;
	if (active instanceof HTMLElement && active.isContentEditable) active.blur();
}

type Action = Drawing | Erasing | TextPicking | TextCarrying | Lassoing | { pan: true; x: number; y: number };

export class Surface {
	private readonly actions = new Map<number, Action>();
	private readonly starts = new Map<number, { x: number; y: number; time: number; far: boolean }>();
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
				tap: (x, y) => this.tap(x, y),
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
		if (action instanceof Drawing && event.pointerType === 'mouse') this.starts.set(event.pointerId, { x: event.clientX, y: event.clientY, time: event.timeStamp, far: false });
	}

	private targetAt(clientX: number, clientY: number) {
		const [, contentY] = this.viewport.toContent(clientX - this.origin.left, clientY - this.origin.top);
		return this.host.target(pageNear(this.viewport.layout, contentY));
	}

	private typeAt(target: Target, clientX: number, clientY: number) {
		const [x, y] = pagePoint(this.viewport, this.origin, target.page, { clientX, clientY });
		this.host.typeAt(target, x, y, [clientX, clientY]);
	}

	private aimAt(target: Target, clientX: number, clientY: number) {
		this.host.aim(target, ...pagePoint(this.viewport, this.origin, target.page, { clientX, clientY }));
	}

	private tap(clientX: number, clientY: number) {
		const rect = this.element.getBoundingClientRect();
		this.origin = { left: rect.left, top: rect.top };
		const target = this.targetAt(clientX, clientY);
		stopTyping();
		if (target) this.aimAt(target, clientX, clientY);
	}

	private toolFor(event: PointerEvent): Tool | null {
		if (event.pointerType === 'pen' && (event.buttons & ERASER_BUTTON || pen.tool === 'eraser')) return 'erase';
		if (tools.active === 'eraser') return 'erase';
		return tools.active === 'draw' ? 'draw' : tools.active;
	}

	private begin(event: PointerEvent, tool: Tool | null): Action | null {
		if (!tool) return null;
		const target = this.targetAt(event.clientX, event.clientY);
		if (!target) return null;
		activity.mark();
		selection.clear();
		editing.aim = null;
		if (tool === 'type' && event.pointerType === 'mouse') {
			this.typeAt(target, event.clientX, event.clientY);
			return null;
		}
		stopTyping();
		if (tool === 'type') {
			this.aimAt(target, event.clientX, event.clientY);
			return null;
		}
		if (tool === 'lasso') return new Lassoing(this.viewport, this.origin, target, this.live, event);
		if (tool === 'text' && this.onPickedText(target, event)) return new TextCarrying(this.element, textSelection.selection.text, event);
		if (tool === 'text') return target.pdf ? new TextPicking(this.viewport, this.origin, target, target.pdf, event) : null;
		if (tool === 'erase') return new Erasing(this.viewport, this.origin, target, tools.eraserMode, tools.eraserRadius, event);
		const preset = tool === 'highlight' ? (tools.presets.find((candidate) => candidate.tool === 'highlighter') ?? tools.preset) : tools.preset;
		const feel = { firmness: settings.values.firmness, stabilization: settings.values.stabilization };
		const guide = this.host.ruler().guide(event.clientX - this.origin.left, event.clientY - this.origin.top, (preset.width * this.viewport.zoom) / 2);
		return new Drawing(this.viewport, this.origin, target, this.live, preset, feel, settings.values.prediction, guide, event);
	}

	private onPickedText(target: Target, event: PointerEvent) {
		if (textSelection.page !== target.id) return false;
		const [x, y] = pagePoint(this.viewport, this.origin, target.page, event);
		return textSelection.selection.rects.some((rect) => x >= rect.left && x <= rect.left + rect.width && y >= rect.top && y <= rect.top + rect.height);
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
		activity.mark();
		if (action instanceof Drawing) {
			const start = this.starts.get(event.pointerId);
			if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > TAP_SLOP) start.far = true;
			if (!this.raw) action.add(event.getCoalescedEvents());
			action.predict(event.getPredictedEvents());
		} else if (action instanceof Erasing) action.move(event.getCoalescedEvents());
		else if (action instanceof TextPicking || action instanceof TextCarrying) action.move(event);
		else if (action instanceof Lassoing) action.move(event.getCoalescedEvents());
		else {
			this.viewport.panBy(action.x - event.clientX, action.y - event.clientY);
			action.x = event.clientX;
			action.y = event.clientY;
		}
	}

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
		const start = this.starts.get(event.pointerId);
		this.actions.delete(event.pointerId);
		this.starts.delete(event.pointerId);
		const tap = action instanceof Drawing ? action.tap() : null;
		if (tap && action instanceof Drawing && this.host.tapped(this.viewport.layout.pages.indexOf(action.target.page), ...tap)) action.cancel();
		else if (action instanceof Drawing && start && !start.far && event.timeStamp - start.time < TAP_TIME) {
			action.cancel();
			this.typeAt(action.target, event.clientX, event.clientY);
		} else if (action instanceof Drawing) {
			const stroke = action.end();
			if (stroke) this.host.wrote(action.target, stroke);
		} else if (action && !('pan' in action)) action.end();
	}

	cancel(event: PointerEvent) {
		if (event.pointerType === 'touch') this.gestures.up(event.pointerId, event.timeStamp);
		const action = this.actions.get(event.pointerId);
		this.actions.delete(event.pointerId);
		this.starts.delete(event.pointerId);
		if (action instanceof Drawing || action instanceof Erasing || action instanceof Lassoing || action instanceof TextCarrying) action.cancel();
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
