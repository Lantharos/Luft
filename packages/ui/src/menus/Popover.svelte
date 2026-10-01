<script lang="ts">
	import type { Snippet } from 'svelte';
	import { besideAnchor, type Align, type AnchorPlacement } from './placement';
	import { topLayer } from './topLayer';

	interface Props {
		anchor: HTMLElement;
		label: string;
		role: 'listbox' | 'dialog' | 'menu';
		align?: Align;
		minWidth?: number;
		maxHeight?: number;
		onclose: () => void;
		children: Snippet;
	}

	let { anchor, label, role, align = 'start', minWidth = 0, maxHeight = 320, onclose, children }: Props = $props();

	let placement = $state<AnchorPlacement | null>(null);

	function closeOnEscape(event: KeyboardEvent) {
		if (event.key !== 'Escape') return;
		event.preventDefault();
		event.stopImmediatePropagation();
		onclose();
	}

	function place(popover: HTMLElement) {
		placement = besideAnchor(anchor.getBoundingClientRect(), { width: popover.offsetWidth, height: popover.offsetHeight }, maxHeight, align);
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
	{role}
	aria-label={label}
	style:left="{placement?.left ?? 0}px"
	style:top={placement?.top == null ? undefined : `${placement.top}px`}
	style:bottom={placement?.bottom == null ? undefined : `${placement.bottom}px`}
	style:min-width="{Math.max(anchor.offsetWidth, minWidth)}px"
	style:max-height="{placement?.maxHeight ?? maxHeight}px"
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
		overflow-y: auto;
		padding: 6px;
		border-radius: 18px;
		background: var(--popover);
		box-shadow: 0 12px 40px var(--shadow-soft);
		visibility: hidden;
	}

	.popover.placed {
		visibility: visible;
		animation: open 160ms var(--ease);
	}

	.popover.above {
		top: auto;
		animation-name: open-above;
	}

	@keyframes open {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
	}

	@keyframes open-above {
		from {
			opacity: 0;
			transform: translateY(4px);
		}
	}
</style>
