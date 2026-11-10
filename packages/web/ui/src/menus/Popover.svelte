<script lang="ts">
	import type { Snippet } from 'svelte';
	import { menu } from '../motion/transitions';
	import { besideAnchor, nextToAnchor, type Align, type AnchorPlacement, type Side } from './placement';
	import { topLayer } from './topLayer';

	interface Props {
		anchor: HTMLElement;
		id?: string;
		label: string;
		role: 'listbox' | 'dialog' | 'menu';
		align?: Align;
		side?: Side;
		minWidth?: number;
		maxHeight?: number;
		onclose: () => void;
		children: Snippet;
	}

	let { anchor, id, label, role, align = 'start', side, minWidth = 0, maxHeight = 320, onclose, children }: Props = $props();

	let placement = $state<AnchorPlacement | null>(null);

	function closeOnEscape(event: KeyboardEvent) {
		if (event.key !== 'Escape') return;
		event.preventDefault();
		event.stopImmediatePropagation();
		onclose();
	}

	function place(popover: HTMLElement) {
		const size = { width: popover.offsetWidth, height: popover.offsetHeight };
		const rect = anchor.getBoundingClientRect();
		placement = side ? nextToAnchor(rect, size, maxHeight, side) : besideAnchor(rect, size, maxHeight, align);
	}
</script>

<svelte:window onblur={onclose} onresize={onclose} onkeydowncapture={closeOnEscape} />

<div {@attach topLayer} class="backdrop" role="presentation" onpointerdown={onclose}></div>
<div
	{@attach topLayer}
	{@attach place}
	class="popover soft-scroll"
	class:placed={placement}
	class:above={placement?.above}
	class:sideways={side}
	{id}
	{role}
	aria-label={label}
	style:left="{placement?.left ?? 0}px"
	style:top={placement?.top == null ? undefined : `${placement.top}px`}
	style:bottom={placement?.bottom == null ? undefined : `${placement.bottom}px`}
	style:min-width="{Math.max(anchor.offsetWidth, minWidth)}px"
	style:max-height="{placement?.maxHeight ?? maxHeight}px"
	out:menu
>
	{@render children()}
</div>

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		width: auto;
		height: auto;
		margin: 0;
		border: 0;
		padding: 0;
		background: transparent;
	}

	.popover {
		position: fixed;
		inset: 0 auto auto 0;
		display: flex;
		margin: 0;
		border: 0;
		color: inherit;
		max-width: calc(100vw - 20px);
		flex-direction: column;
		gap: 2px;
		overflow: hidden auto;
		padding: 6px;
		border-radius: 18px;
		background: var(--popover);
		box-shadow: 0 12px 40px var(--shadow-soft);
		visibility: hidden;
		transform-origin: top;
	}

	.popover.placed {
		visibility: visible;
		animation: open var(--motion-standard) var(--ease-decelerate);
	}

	.popover.above {
		top: auto;
		transform-origin: bottom;
		animation-name: open-above;
	}

	.popover.sideways {
		transform-origin: center;
		animation-name: open-sideways;
	}

	:global(:root[data-motion='reduced']) .popover.placed {
		animation-name: fade-in;
	}

	@keyframes open-sideways {
		from {
			opacity: 0;
			transform: scale(0.96);
		}
	}

	@keyframes open {
		from {
			opacity: 0;
			transform: translateY(-4px) scale(0.98);
		}
	}

	@keyframes open-above {
		from {
			opacity: 0;
			transform: translateY(4px) scale(0.98);
		}
	}
</style>
