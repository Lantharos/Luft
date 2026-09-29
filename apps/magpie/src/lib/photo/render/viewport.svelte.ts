import type { Placement } from './matrix';

const MAX_SCALE = 32;
const ANIMATION_MS = 200;
const STEP = 1.25;

interface Target {
	scale: number;
	offsetX: number;
	offsetY: number;
}

function easeOut(progress: number) {
	return 1 - (1 - progress) ** 3;
}

export class Viewport {
	stageWidth = $state(0);
	stageHeight = $state(0);
	imageWidth = $state(0);
	imageHeight = $state(0);
	pixelRatio = $state(1);
	rotation = $state(0);
	flipped = $state(false);
	scale = $state(1);
	offsetX = $state(0);
	offsetY = $state(0);
	fitted = $state(true);

	#animation = 0;

	turnedWidth = $derived(this.rotation % 2 ? this.imageHeight : this.imageWidth);
	turnedHeight = $derived(this.rotation % 2 ? this.imageWidth : this.imageHeight);
	fitScale = $derived(
		this.turnedWidth && this.stageWidth ? Math.min(this.stageWidth / this.turnedWidth, this.stageHeight / this.turnedHeight, 1) : 1
	);
	minScale = $derived(Math.min(this.fitScale, 1));
	zoomed = $derived(this.scale > this.fitScale * 1.001);
	placement = $derived<Placement>({
		stageWidth: this.stageWidth,
		stageHeight: this.stageHeight,
		imageWidth: this.imageWidth,
		imageHeight: this.imageHeight,
		scale: this.scale,
		rotation: this.rotation,
		flipped: this.flipped,
		offsetX: this.offsetX,
		offsetY: this.offsetY,
		pixelRatio: this.pixelRatio
	});

	setImage(width: number, height: number) {
		this.imageWidth = width;
		this.imageHeight = height;
		this.fit(false);
	}

	resize(width: number, height: number, pixelRatio: number) {
		this.stageWidth = width;
		this.stageHeight = height;
		this.pixelRatio = pixelRatio;
		if (this.fitted) this.#jump({ scale: this.fitScale, offsetX: 0, offsetY: 0 });
		else this.#jump(this.#clamped({ scale: this.scale, offsetX: this.offsetX, offsetY: this.offsetY }));
	}

	fit(animate = true) {
		this.fitted = true;
		this.#go({ scale: this.fitScale, offsetX: 0, offsetY: 0 }, animate);
	}

	zoomTo(scale: number, anchorX = this.stageWidth / 2, anchorY = this.stageHeight / 2, animate = true) {
		const next = Math.min(MAX_SCALE, Math.max(this.minScale, scale));
		const ratio = next / this.scale;
		const fromCenterX = anchorX - this.stageWidth / 2;
		const fromCenterY = anchorY - this.stageHeight / 2;
		this.fitted = next <= this.fitScale;
		this.#go(
			this.#clamped({
				scale: next,
				offsetX: fromCenterX - (fromCenterX - this.offsetX) * ratio,
				offsetY: fromCenterY - (fromCenterY - this.offsetY) * ratio
			}),
			animate
		);
	}

	zoomBy(factor: number, anchorX?: number, anchorY?: number, animate = true) {
		this.zoomTo(this.scale * factor, anchorX, anchorY, animate);
	}

	zoomIn() {
		this.zoomBy(STEP);
	}

	zoomOut() {
		this.zoomBy(1 / STEP);
	}

	actualSize(anchorX?: number, anchorY?: number) {
		const target = this.fitScale >= 1 ? 2 : 1;
		this.zoomTo(this.zoomed ? this.fitScale : target, anchorX, anchorY);
	}

	pan(deltaX: number, deltaY: number) {
		this.#jump(this.#clamped({ scale: this.scale, offsetX: this.offsetX + deltaX, offsetY: this.offsetY + deltaY }));
	}

	rotate(direction: 1 | -1) {
		this.rotation = (this.rotation + direction + 4) % 4;
		this.fit(false);
	}

	flip() {
		this.flipped = !this.flipped;
	}

	#clamped(target: Target): Target {
		const spareX = Math.max(0, (this.turnedWidth * target.scale - this.stageWidth) / 2);
		const spareY = Math.max(0, (this.turnedHeight * target.scale - this.stageHeight) / 2);
		return {
			scale: target.scale,
			offsetX: Math.min(spareX, Math.max(-spareX, target.offsetX)),
			offsetY: Math.min(spareY, Math.max(-spareY, target.offsetY))
		};
	}

	#go(target: Target, animate: boolean) {
		if (animate && matchMedia('(prefers-reduced-motion: no-preference)').matches) this.#animate(target);
		else this.#jump(target);
	}

	#jump(target: Target) {
		cancelAnimationFrame(this.#animation);
		this.#animation = 0;
		this.scale = target.scale;
		this.offsetX = target.offsetX;
		this.offsetY = target.offsetY;
	}

	#animate(target: Target) {
		cancelAnimationFrame(this.#animation);
		const from: Target = { scale: this.scale, offsetX: this.offsetX, offsetY: this.offsetY };
		const started = performance.now();
		const tick = (now: number) => {
			const progress = Math.min(1, (now - started) / ANIMATION_MS);
			const eased = easeOut(progress);
			this.scale = from.scale * (target.scale / from.scale) ** eased;
			this.offsetX = from.offsetX + (target.offsetX - from.offsetX) * eased;
			this.offsetY = from.offsetY + (target.offsetY - from.offsetY) * eased;
			this.#animation = progress < 1 ? requestAnimationFrame(tick) : 0;
		};
		this.#animation = requestAnimationFrame(tick);
	}
}
