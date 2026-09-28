import type { Attachment } from 'svelte/attachments';

const SHOW_DELAY_MS = 550;
const WARM_MS = 400;
const GAP = 8;
const MARGIN = 8;

let bubble: HTMLDivElement | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
let hiddenAt = 0;

function place(anchor: HTMLElement, text: string) {
	bubble ??= Object.assign(document.createElement('div'), { className: 'tooltip' });
	bubble.textContent = text;
	document.body.append(bubble);
	const box = anchor.getBoundingClientRect();
	const { offsetWidth: width, offsetHeight: height } = bubble;
	const below = box.bottom + GAP + height + MARGIN <= innerHeight;
	const left = Math.min(Math.max(MARGIN, box.left + box.width / 2 - width / 2), innerWidth - width - MARGIN);
	bubble.style.left = `${left}px`;
	bubble.style.top = `${below ? box.bottom + GAP : box.top - GAP - height}px`;
}

function hide() {
	clearTimeout(timer);
	if (!bubble?.isConnected) return;
	bubble.remove();
	hiddenAt = performance.now();
}

export function tooltip(text: string): Attachment<HTMLElement> {
	return (node) => {
		const enter = () => {
			clearTimeout(timer);
			const warm = performance.now() - hiddenAt < WARM_MS;
			timer = setTimeout(() => place(node, text), warm ? 0 : SHOW_DELAY_MS);
		};
		node.addEventListener('pointerenter', enter);
		node.addEventListener('pointerleave', hide);
		node.addEventListener('pointerdown', hide);
		return () => {
			hide();
			node.removeEventListener('pointerenter', enter);
			node.removeEventListener('pointerleave', hide);
			node.removeEventListener('pointerdown', hide);
		};
	};
}
