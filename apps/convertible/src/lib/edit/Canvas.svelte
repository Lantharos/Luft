<script lang="ts">
	import { fileUrl } from '@lantharos/sabine';
	import { t } from '@luft/i18n';
	import type { Mark, Point, Rect } from '#lib/bindings.js';
	import { editor } from '#lib/state/editor.svelte.js';
	import { drawCensor, drawMark, hit, moved, normalized } from './draw';

	const STROKE_SHARE = 1 / 220;
	const TEXT_SHARE = 1 / 28;
	const BLUR_SHARE = 1 / 90;
	const MIN_AREA = 4;

	let holder = $state<HTMLDivElement>();
	let canvas = $state<HTMLCanvasElement>();
	let picture = $state.raw<HTMLImageElement | null>(null);
	let size = $state({ width: 0, height: 0 });
	let draft = $state.raw<Mark | null>(null);
	let cropping = $state.raw<Rect | null>(null);
	let typing = $state.raw<{ at: Point; text: string } | null>(null);
	let baseline = '';
	let grabbed: Point | null = null;
	let anchor: Point | null = null;

	const shorter = $derived(Math.min(editor.width, editor.height));
	const scale = $derived(editor.width && size.width ? Math.min(size.width / editor.width, size.height / editor.height, 1) : 1);
	const stroke = $derived(Math.max(2, Math.round(shorter * STROKE_SHARE)));

	$effect(() => {
		const path = editor.preview?.path;
		if (!path) return;
		const image = new Image();
		image.onload = () => {
			picture = image;
		};
		image.src = fileUrl(path);
		return () => {
			image.onload = null;
		};
	});

	$effect(() => {
		if (!holder) return;
		const observer = new ResizeObserver(([entry]) => {
			size = { width: entry.contentRect.width, height: entry.contentRect.height };
		});
		observer.observe(holder);
		return () => observer.disconnect();
	});

	function filter() {
		const { brightness, contrast, saturation } = editor.edits;
		return `brightness(${1 + brightness}) contrast(${1 + contrast}) saturate(${1 + saturation})`;
	}

	function paintPicture(context: CanvasRenderingContext2D, image: HTMLImageElement) {
		const { rotate, flipHorizontal } = editor.edits;
		context.save();
		context.translate(editor.width / 2, editor.height / 2);
		if (flipHorizontal) context.scale(-1, 1);
		context.rotate((rotate * Math.PI) / 180);
		context.drawImage(image, -editor.sourceWidth / 2, -editor.sourceHeight / 2, editor.sourceWidth, editor.sourceHeight);
		context.restore();
	}

	function paintSelection(context: CanvasRenderingContext2D) {
		const index = editor.selectedMark;
		const mark = index === null ? null : editor.edits.marks[index];
		if (!mark || !('area' in mark)) return;
		context.strokeStyle = '#fff';
		context.lineWidth = 1 / scale;
		context.setLineDash([6 / scale, 4 / scale]);
		context.strokeRect(mark.area.x, mark.area.y, mark.area.width, mark.area.height);
		context.setLineDash([]);
	}

	function paintCrop(context: CanvasRenderingContext2D, area: Rect) {
		context.fillStyle = 'rgba(0, 0, 0, 0.55)';
		context.beginPath();
		context.rect(0, 0, editor.width, editor.height);
		context.rect(area.x, area.y, area.width, area.height);
		context.fill('evenodd');
		context.strokeStyle = '#fff';
		context.lineWidth = 1.5 / scale;
		context.strokeRect(area.x, area.y, area.width, area.height);
	}

	function paint() {
		if (!canvas || !picture || !editor.width) return;
		const ratio = window.devicePixelRatio;
		const context = canvas.getContext('2d', { alpha: true })!;
		context.setTransform(scale * ratio, 0, 0, scale * ratio, 0, 0);
		context.clearRect(0, 0, editor.width, editor.height);
		context.filter = filter();
		const image = picture;
		const repaint = () => paintPicture(context, image);
		repaint();
		const marks = draft ? [...editor.edits.marks, draft] : editor.edits.marks;
		for (const mark of marks) drawCensor(context, mark, repaint);
		context.filter = 'none';
		for (const mark of marks) drawMark(context, mark);
		paintSelection(context);
		const area = cropping ?? editor.edits.crop;
		if (area) paintCrop(context, area);
	}

	$effect(() => {
		if (!canvas || !editor.width) return;
		const ratio = window.devicePixelRatio;
		canvas.width = Math.round(editor.width * scale * ratio);
		canvas.height = Math.round(editor.height * scale * ratio);
		canvas.style.width = `${editor.width * scale}px`;
		canvas.style.height = `${editor.height * scale}px`;
		JSON.stringify(editor.edits);
		void draft;
		void cropping;
		void editor.selectedMark;
		paint();
	});

	function position(event: PointerEvent): Point {
		const box = canvas!.getBoundingClientRect();
		return {
			x: Math.max(0, Math.min(editor.width, (event.clientX - box.left) / scale)),
			y: Math.max(0, Math.min(editor.height, (event.clientY - box.top) / scale))
		};
	}

	function shaped(from: Point, to: Point): Mark | null {
		const area = normalized(from, to);
		const color = editor.color;
		switch (editor.tool) {
			case 'arrow':
				return { kind: 'arrow', from, to, color, width: stroke };
			case 'line':
				return { kind: 'line', from, to, color, width: stroke };
			case 'box':
				return { kind: 'box', area, color, width: stroke };
			case 'ellipse':
				return { kind: 'ellipse', area, color, width: stroke };
			case 'highlight':
				return { kind: 'highlight', area, color: '#ffd84d' };
			case 'blur':
				return { kind: 'blur', area, strength: Math.max(6, Math.round(shorter * BLUR_SHARE)) };
			case 'redact':
				return { kind: 'redact', area };
			default:
				return null;
		}
	}

	function pointerdown(event: PointerEvent) {
		if (event.button !== 0) return;
		commitText();
		canvas!.setPointerCapture(event.pointerId);
		anchor = position(event);
		baseline = JSON.stringify(editor.edits);
		if (editor.tool === 'text') {
			typing = { at: anchor, text: '' };
			anchor = null;
		} else if (editor.tool === 'move') {
			const marks = editor.edits.marks;
			const reach = 6 / scale;
			const index = marks.findLastIndex((mark) => hit(mark, anchor!, reach));
			editor.selectedMark = index >= 0 ? index : null;
			grabbed = index >= 0 ? anchor : null;
		}
	}

	function pointermove(event: PointerEvent) {
		if (!anchor) return;
		const point = position(event);
		if (editor.tool === 'crop') cropping = normalized(anchor, point);
		else if (editor.tool === 'move' && grabbed && editor.selectedMark !== null) {
			const index = editor.selectedMark;
			editor.edits.marks[index] = moved(editor.edits.marks[index], point.x - grabbed.x, point.y - grabbed.y);
			grabbed = point;
		} else draft = shaped(anchor, point);
	}

	function pointerup() {
		if (!anchor) return;
		if (editor.tool === 'crop' && cropping && cropping.width > MIN_AREA && cropping.height > MIN_AREA) {
			const area = { ...cropping };
			editor.change((edits) => {
				edits.crop = area;
			});
		} else if (editor.tool === 'move') editor.commit(baseline);
		else if (draft && ('area' in draft ? draft.area.width > MIN_AREA && draft.area.height > MIN_AREA : true)) {
			const mark = draft;
			editor.change((edits) => void edits.marks.push(mark));
		}
		anchor = null;
		grabbed = null;
		draft = null;
		cropping = null;
	}

	function commitText() {
		const entry = typing;
		typing = null;
		if (!entry?.text.trim()) return;
		const size = Math.round(shorter * TEXT_SHARE);
		const at = { x: entry.at.x, y: entry.at.y + size * 0.35 };
		editor.change((edits) => void edits.marks.push({ kind: 'text', at, text: entry.text, color: editor.color, size }));
	}

	function textKeys(event: KeyboardEvent) {
		event.stopPropagation();
		if (event.key === 'Enter') commitText();
		if (event.key === 'Escape') typing = null;
	}
</script>

<div bind:this={holder} class="relative flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden">
	<div class="relative">
		<canvas
			bind:this={canvas}
			class="block touch-none rounded-[6px]"
			class:crosshair={editor.tool !== 'move'}
			aria-label={t('edit-canvas')}
			onpointerdown={pointerdown}
			onpointermove={pointermove}
			onpointerup={pointerup}
		></canvas>
		{#if typing}
			<input
				class="mark-text"
				style:left="{typing.at.x * scale}px"
				style:top="{typing.at.y * scale}px"
				style:color={editor.color}
				style:font-size="{Math.round(shorter * TEXT_SHARE) * scale}px"
				aria-label={t('edit-text-entry')}
				bind:value={typing.text}
				onkeydown={textKeys}
				onblur={commitText}
				{@attach (element) => element.focus()}
			/>
		{/if}
	</div>
</div>

<style>
	.crosshair {
		cursor: crosshair;
	}

	.mark-text {
		position: absolute;
		transform: translateY(-50%);
		min-width: 120px;
		border: 0;
		outline: 1px dashed currentColor;
		outline-offset: 2px;
		background: transparent;
		font-weight: 500;
	}
</style>
