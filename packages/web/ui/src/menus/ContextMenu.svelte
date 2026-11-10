<script lang="ts">
	import type { Snippet } from 'svelte';
	import { menu } from '../motion/transitions';
	import { atPoint, type Point, type PointPlacement } from './placement';
	import { topLayer } from './topLayer';

	interface Props {
		at: Point;
		/** Leaves focus where it is, for menus over a field that settles when it loses focus. */
		keepFocus?: boolean;
		onclose: () => void;
		children: Snippet;
	}

	let { at, keepFocus = false, onclose, children }: Props = $props();

	const ITEMS = '[role^="menuitem"]:not(:disabled)';

	let placement = $state<PointPlacement | null>(null);
	let element = $state<HTMLElement>();

	function closeOutside(event: PointerEvent) {
		if (!element?.contains(event.target as Node)) onclose();
	}

	function closeOnEscape(event: KeyboardEvent) {
		if (event.key !== 'Escape') return;
		event.preventDefault();
		event.stopImmediatePropagation();
		onclose();
	}

	function place(menu: HTMLElement) {
		placement = atPoint(at, { width: menu.offsetWidth, height: menu.offsetHeight });
	}

	$effect(() => {
		if (keepFocus || !placement || !element) return;
		const menu = element;
		const opener = document.activeElement as HTMLElement | null;
		menu.focus();
		return () => {
			const focused = document.activeElement;
			if (focused === document.body || menu.contains(focused)) opener?.focus();
		};
	});

	function navigate(event: KeyboardEvent & { currentTarget: HTMLElement }) {
		if (event.key === 'Tab') {
			event.preventDefault();
			return onclose();
		}
		const items = [...event.currentTarget.querySelectorAll<HTMLElement>(ITEMS)];
		const current = items.indexOf(document.activeElement as HTMLElement);
		const steps: Record<string, number> = { ArrowDown: current + 1, ArrowUp: current < 0 ? -1 : current - 1, Home: 0, End: -1 };
		if (!(event.key in steps) || !items.length) return;
		event.preventDefault();
		event.stopPropagation();
		items.at(steps[event.key] % items.length)!.focus();
	}

	const stop = (event: Event) => event.stopPropagation();
</script>

<svelte:window onblur={onclose} onresize={onclose} onpointerdowncapture={closeOutside} onkeydowncapture={closeOnEscape} />

<div
	bind:this={element}
	{@attach topLayer}
	{@attach place}
	class="menu soft-scroll"
	class:placed={placement}
	style:left="{placement?.left ?? at.x}px"
	style:top="{placement?.top ?? at.y}px"
	style:transform-origin={placement?.origin ?? 'top left'}
	role="menu"
	tabindex="-1"
	onkeydown={navigate}
	onclick={stop}
	onpointerdown={stop}
	oncontextmenu={stop}
	out:menu
>
	{@render children()}
</div>

<style>
	.menu {
		position: fixed;
		inset: auto;
		display: flex;
		margin: 0;
		border: 0;
		color: inherit;
		max-height: calc(100vh - 20px);
		min-width: 196px;
		max-width: calc(100vw - 20px);
		flex-direction: column;
		overflow-y: auto;
		padding: 4px;
		border-radius: 18px;
		background: var(--popover);
		box-shadow: 0 12px 40px var(--shadow-soft);
		outline: none;
		visibility: hidden;
	}

	.menu.placed {
		visibility: visible;
		animation: open var(--motion-standard) var(--ease-decelerate);
	}

	:global(:root[data-motion='reduced']) .menu.placed {
		animation-name: fade-in;
	}

	@keyframes open {
		from {
			opacity: 0;
			scale: 0.98;
		}
	}
</style>
