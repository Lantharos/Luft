<script lang="ts">
	import { onMount } from 'svelte';
	import { appearance, GlassShell, WindowControls } from '@luft/ui';
	import OpenFailedDialog from '#lib/components/OpenFailedDialog.svelte';
	import { FileInstall } from '#lib/files/install.svelte.js';
	import { opening } from '#lib/state/opening.svelte.js';
	import Installer from './Installer.svelte';
	import { startInstall } from './start.js';

	let { request }: { request: number } = $props();

	let install = $state<FileInstall | null>(null);

	onMount(() => {
		void startInstall(request).then((path) => {
			install = new FileInstall(path);
			void install.load();
		});
	});

	$effect(() => {
		document.documentElement.dataset.scheme = appearance.scheme;
	});
</script>

<GlassShell>
	<main class="glass-content relative">
		<div class="drag-region absolute inset-x-0 top-0 h-7"></div>
		<div class="absolute top-3 right-4 z-10">
			<WindowControls minimizable={false} maximizable={false} />
		</div>
		{#if install}
			<Installer {install} />
		{/if}
	</main>
</GlassShell>

{#if opening.failed}
	<OpenFailedDialog failed={opening.failed} />
{/if}
