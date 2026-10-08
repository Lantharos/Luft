<script lang="ts">
	import { useApp } from '#lib/context.js';
	import DiskBar from './DiskBar.svelte';
	import Welcome from './Welcome.svelte';

	const app = useApp();
	let workspace = $derived(app.workspace);
	let active = $derived(workspace.active);

	const WHEEL_STEP = 40;

	function host(node: HTMLElement) {
		return workspace.editor.mount(node);
	}

	function zoomOnWheel(node: HTMLElement) {
		let pending = 0;
		const wheel = (event: WheelEvent) => {
			if (!event.ctrlKey) return;
			event.preventDefault();
			pending += event.deltaY;
			if (Math.abs(pending) < WHEEL_STEP) return;
			app.zoom(pending < 0 ? 1 : -1);
			pending = 0;
		};
		node.addEventListener('wheel', wheel, { passive: false });
		return () => node.removeEventListener('wheel', wheel);
	}
</script>

<section class="relative flex min-w-0 flex-1 flex-col" {@attach zoomOnWheel}>
	{#if active && active.disk !== 'current'}
		<DiskBar document={active} />
	{/if}
	<div class="editor-host min-h-0 flex-1" inert={!active} {@attach host}></div>
	{#if !active && app.ready}
		<Welcome />
	{/if}
</section>

<style>
	.editor-host :global(.cm-editor) {
		height: 100%;
	}
</style>
