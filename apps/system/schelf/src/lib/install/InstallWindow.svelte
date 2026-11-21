<script lang="ts">
	import { onMount } from 'svelte';
	import { appearance, GlassShell, Spinner, WindowControls } from '@luft/ui';
	import { FileInstall } from '#lib/files/install.svelte.js';
	import { openDialog } from './dialogs/dialog.js';
	import Installer from './Installer.svelte';
	import { startInstall } from './start.js';

	let { request }: { request: number } = $props();

	let install = $state<FileInstall | null>(null);

	onMount(() => {
		void startInstall(request).then((path) => {
			install = new FileInstall(path, (dialog) => openDialog(request, dialog));
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
		{#if install?.file || install?.error}
			<Installer {install} />
		{:else}
			<div class="flex min-h-0 flex-1 items-center justify-center text-[var(--text-muted)]"><Spinner size={22} /></div>
		{/if}
	</main>
</GlassShell>
