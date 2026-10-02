<script lang="ts">
	import { onMount } from 'svelte';
	import { isAvailable } from '@lantharos/sabine';
	import { appearance, GlassShell } from '@luft/ui';
	import LayoutEditor from '$lib/layout/LayoutEditor.svelte';
	import NewLayoutDialog from '$lib/layout/NewLayoutDialog.svelte';
	import MethodEditor from '$lib/method/MethodEditor.svelte';
	import NewMethodDialog from '$lib/method/NewMethodDialog.svelte';
	import Sidebar from '$lib/shell/Sidebar.svelte';
	import Toast from '$lib/shell/Toast.svelte';
	import Welcome from '$lib/shell/Welcome.svelte';
	import { app, type Selection } from '$lib/state/app.svelte';

	onMount(() => {
		if (isAvailable()) void app.start();
	});

	$effect(() => {
		document.documentElement.dataset.scheme = appearance.scheme;
	});

	async function created(selection: Selection) {
		app.creating = null;
		await app.refresh();
		app.select(selection);
	}
</script>

<GlassShell class="[--sidebar-width:260px]">
	<Sidebar />
	{#if app.selection?.kind === 'layout'}
		{#key app.selection.id}
			<LayoutEditor id={app.selection.id} />
		{/key}
	{:else if app.selection?.kind === 'method'}
		{#key app.selection.id}
			<MethodEditor id={app.selection.id} />
		{/key}
	{:else}
		<Welcome />
	{/if}
</GlassShell>

{#if app.creating?.kind === 'layout'}
	<NewLayoutDialog from={app.creating.from} oncreated={(layout) => void created({ kind: 'layout', id: layout.id })} onclose={() => (app.creating = null)} />
{:else if app.creating?.kind === 'method'}
	<NewMethodDialog oncreated={(method) => void created({ kind: 'method', id: method.id })} onclose={() => (app.creating = null)} />
{/if}

<Toast />
