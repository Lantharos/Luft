<script lang="ts">
	import { useApp } from '$lib/context';
	import DiskBar from './DiskBar.svelte';
	import Welcome from './Welcome.svelte';

	const app = useApp();
	let workspace = $derived(app.workspace);
	let active = $derived(workspace.active);

	function host(node: HTMLElement) {
		return workspace.editor.mount(node);
	}
</script>

<section class="relative flex min-w-0 flex-1 flex-col">
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
