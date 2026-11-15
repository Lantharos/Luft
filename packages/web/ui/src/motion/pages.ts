import { Duration, Role } from '@luft/motion';
import type { Attachment } from 'svelte/attachments';
import { motionPreference } from './preference';

type Way = 'deeper' | 'shallower' | 'below' | 'above';

interface Visit {
	key: string;
	scroll: number;
}

const MOST_GHOSTS = 2;

const OFFSETS: Record<Way, { enter: string; leave: string }> = {
	deeper: { enter: 'translateX(56px)', leave: 'translateX(-24px)' },
	shallower: { enter: 'translateX(-24px)', leave: 'translateX(56px)' },
	below: { enter: 'translateY(20px)', leave: 'translateY(-10px)' },
	above: { enter: 'translateY(-20px)', leave: 'translateY(10px)' }
};

const travel = (way: Way) => (way === 'deeper' || way === 'shallower' ? Role.drill : Role.switch);

export class PageMotion {
	#layer: HTMLElement | null = null;
	#scroller: HTMLElement | null = null;
	#page: HTMLElement | null = null;
	#entering: Animation | null = null;
	#arriving: Way | null = null;
	#order = 0;
	#trail: Visit[] = [];
	#settling = false;
	#restoring: (() => void) | null = null;

	layer: Attachment<HTMLElement> = (layer) => {
		this.#layer = layer;
	};

	scroller: Attachment<HTMLElement> = (scroller) => {
		this.#scroller = scroller;
	};

	page: Attachment<HTMLElement> = (page) => {
		this.#page = page;
		if (this.#arriving) this.#enter(page, this.#arriving);
		this.#arriving = null;
		return () => {
			if (this.#page === page) this.#page = null;
		};
	};

	switchTo(order: number): void {
		const way = order > this.#order ? 'below' : 'above';
		this.#order = order;
		this.#trail = [];
		this.#settle();
		if (!this.#page) return;
		this.#leave(this.#page, this.#page.cloneNode(true) as HTMLElement, way);
		this.#arriving = way;
		this.#scroll(0);
	}

	open(key: string): void {
		const page = this.#page;
		if (this.#settling || !page) {
			this.#trail.push({ key, scroll: 0 });
			return;
		}
		this.#settle();
		const back = this.#trail.at(-2)?.key === key;
		const way = back ? 'shallower' : 'deeper';
		this.#leave(page, page.cloneNode(true) as HTMLElement, way);
		if (back) this.#scroll(this.#trail.pop()!.scroll);
		else {
			this.#trail.push({ key, scroll: this.#scroller?.scrollTop ?? 0 });
			this.#scroll(0);
		}
		this.#enter(page, way);
	}

	close(content: HTMLElement): void {
		const page = this.#page;
		if (this.#settling || !page) return;
		this.#settle();
		const shell = page.cloneNode(false) as HTMLElement;
		shell.append(content.cloneNode(true));
		this.#leave(page, shell, 'shallower', content);
		this.#scroll(this.#trail.pop()?.scroll ?? 0);
		this.#enter(page, 'shallower');
	}

	#settle() {
		this.#settling = true;
		queueMicrotask(() => (this.#settling = false));
	}

	#scroll(top: number) {
		this.#restoring?.();
		const scroller = this.#scroller;
		const page = this.#page;
		if (!scroller) return;
		scroller.scrollTop = top;
		if (!page || !top) return;
		const grows = new ResizeObserver(() => (scroller.scrollTop = top));
		const timer = setTimeout(() => stop(), Duration.linger);
		const inputs = ['wheel', 'pointerdown', 'keydown'];
		const stop = () => {
			grows.disconnect();
			clearTimeout(timer);
			inputs.forEach((input) => scroller.removeEventListener(input, stop));
			this.#restoring = null;
		};
		grows.observe(page);
		inputs.forEach((input) => scroller.addEventListener(input, stop, { passive: true }));
		this.#restoring = stop;
	}

	#leave(page: HTMLElement, ghost: HTMLElement, way: Way, from: HTMLElement = page) {
		const layer = this.#layer;
		const preference = motionPreference();
		if (!layer || preference === 'off') return;
		const { transform, opacity } = getComputedStyle(page);
		const shift = new DOMMatrixReadOnly(transform);
		const at = from.getBoundingClientRect();
		const box = layer.getBoundingClientRect();
		ghost.inert = true;
		Object.assign(ghost.style, { position: 'absolute', top: `${at.top - shift.m42 - box.top}px`, left: `${at.left - shift.m41 - box.left}px`, width: `${at.width}px`, margin: '0' });
		while (layer.childElementCount >= MOST_GHOSTS) layer.firstElementChild!.remove();
		layer.append(ghost);
		const full = preference === 'full';
		const timing = full ? travel(way) : Role.leave;
		const frames: Keyframe[] = full
			? [{ transform, opacity }, { opacity: 0, offset: 0.6 }, { transform: OFFSETS[way].leave, opacity: 0 }]
			: [{ opacity }, { opacity: 0 }];
		void ghost.animate(frames, { duration: timing.duration, easing: timing.easing, fill: 'forwards' }).finished.then(() => ghost.remove());
	}

	#enter(page: HTMLElement, way: Way) {
		this.#entering?.cancel();
		const preference = motionPreference();
		if (preference === 'off') return;
		const full = preference === 'full';
		const timing = full ? travel(way) : Role.reveal;
		const frames: Keyframe[] = full
			? [{ transform: OFFSETS[way].enter, opacity: 0 }, { opacity: 1, offset: 0.5 }, { transform: 'none', opacity: 1 }]
			: [{ opacity: 0 }, { opacity: 1 }];
		this.#entering = page.animate(frames, { duration: timing.duration, easing: timing.easing });
	}
}
