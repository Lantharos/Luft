import { Duration, Role } from '@luft/motion';
import { createContext } from 'svelte';
import type { Attachment } from 'svelte/attachments';
import { motionPreference } from '../motion/preference';

type Way = 'deeper' | 'shallower' | 'below' | 'above';

export interface Place {
	order: number;
	depth: number;
}

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

function wayBetween(from: Place, to: Place): Way | null {
	if (to.order !== from.order) return to.order > from.order ? 'below' : 'above';
	if (to.depth !== from.depth) return to.depth > from.depth ? 'deeper' : 'shallower';
	return null;
}

function keepScroll(source: Element, copy: Element) {
	const sources = document.createTreeWalker(source, NodeFilter.SHOW_ELEMENT);
	const copies = document.createTreeWalker(copy, NodeFilter.SHOW_ELEMENT);
	for (let from = sources.currentNode as Element, to = copies.currentNode as Element; from && to; from = sources.nextNode() as Element, to = copies.nextNode() as Element) {
		if (from.scrollTop || from.scrollLeft) to.scrollTo(from.scrollLeft, from.scrollTop);
	}
}

export class PageMotion {
	#layer: HTMLElement | null = null;
	#scroller: HTMLElement | null = null;
	#page: HTMLElement | null = null;
	#entering: Animation | null = null;
	#arriving: { way: Way; scroll: number } | null = null;
	#place: Place | null = null;
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
		const arriving = this.#arriving;
		this.#arriving = null;
		if (arriving) {
			this.#scroll(arriving.scroll);
			this.#enter(page, arriving.way);
		}
		return () => {
			if (this.#page === page) this.#page = null;
		};
	};

	arrive(place: Place): void {
		const from = this.#place;
		this.#place = place;
		const way = from && wayBetween(from, place);
		if (!way) return;
		this.#settle();
		let scroll = 0;
		if (way === 'deeper') this.#trail.push({ key: `${from.depth}`, scroll: this.#scroller?.scrollTop ?? 0 });
		else if (way === 'shallower') scroll = this.#trail.splice(place.depth).at(0)?.scroll ?? 0;
		else this.#trail = [];
		if (this.#page) this.#leave(this.#page, this.#page.cloneNode(true) as HTMLElement, way);
		this.#arriving = { way, scroll };
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
		keepScroll(from, from === page ? ghost : ghost.firstElementChild!);
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
		const scroller = this.#scroller;
		const fits = !!scroller && scroller.scrollHeight <= scroller.clientHeight;
		this.#entering = page.animate(frames, { duration: timing.duration, easing: timing.easing });
		if (scroller && fits) this.#holdScrollbar(scroller, this.#entering);
	}

	#holdScrollbar(scroller: HTMLElement, entering: Animation) {
		scroller.style.overflowY = 'hidden';
		const release = () => scroller.style.removeProperty('overflow-y');
		entering.addEventListener('finish', release, { once: true });
		entering.addEventListener('cancel', release, { once: true });
	}
}

export const [pageMotion, providePageMotion] = createContext<PageMotion>();
