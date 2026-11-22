<script lang="ts">
	import { onMount } from 'svelte';
	import { appWindow } from '@lantharos/sabine';
	import { appearance, GlassShell } from '@luft/ui';
	import PanelStage from '#lib/components/PanelStage.svelte';
	import Sidebar from '#lib/components/Sidebar.svelte';
	import { app } from '#lib/state/app.svelte.js';

	onMount(() => {
		appWindow.revealWhen(app.start());
	});

	$effect(() => {
		document.documentElement.dataset.scheme = appearance.scheme;
	});
</script>

<GlassShell>
	<Sidebar />
	<main class="glass-content">
		<PanelStage />
	</main>
</GlassShell>
