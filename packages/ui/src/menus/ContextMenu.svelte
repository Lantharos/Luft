<script lang="ts">
	import type { Snippet } from 'svelte';
	import { atPoint, type Point, type PointPlacement } from './placement';
	import { topLayer } from './topLayer';

	interface Props {
		at: Point;
		onclose: () => void;
		children: Snippet;
	}

	let { at, onclose, children }: Props = $props();

	let placement = $state<PointPlacement | null>(null);

	function place(menu: HTMLElement) {
		placement = atPoint(at, { width: menu.offsetWidth, height: menu.offsetHeight });
	}

	const stop = (event: Event) => event.stopPropagation();
</script>

<svelte:window onresize={onclose} />

<div
	{@attach topLayer}
	{@attach place}
	class="menu soft-scroll"
	class:placed={placement}
	style:left="{placement?.left ?? at.x}px"
	style:top="{placement?.top ?? at.y}px"
	style:transform-origin={placement?.origin ?? 'top left'}
	role="menu"
	tabindex="-1"
	onkeydown={(event) => event.key === 'Escape' && onclose()}
	onclick={stop}
	onpointerdown={stop}
	oncontextmenu={stop}
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
		opacity: 0;
		scale: 0.98;
		transition-property: opacity, scale;
		transition-duration: 120ms;
	}

	.menu.placed {
		opacity: 1;
		scale: 1;
	}
</style>
