<script lang="ts">
	import { onMount } from 'svelte';
	import { appearance, GlassShell, PageStage, Toast } from '@luft/ui';
	import LayoutEditor from '#lib/layout/LayoutEditor.svelte';
	import NewLayoutDialog from '#lib/layout/NewLayoutDialog.svelte';
	import MethodEditor from '#lib/method/MethodEditor.svelte';
	import NewMethodDialog from '#lib/method/NewMethodDialog.svelte';
	import Sidebar from '#lib/shell/Sidebar.svelte';
	import Welcome from '#lib/shell/Welcome.svelte';
	import LayoutView from '#lib/view/LayoutView.svelte';
	import { app, type Selection } from '#lib/state/app.svelte.js';
	import { toast } from '#lib/state/toast.svelte.js';

	onMount(() => {
		void app.start();
	});

	$effect(() => {
		document.documentElement.dataset.scheme = appearance.scheme;
	});

	let page = $derived(app.selection ? `${app.selection.kind}:${app.selection.id}` : null);
	let order = $derived.by(() => {
		const selection = app.selection;
		if (!selection) return -1;
		if (selection.kind === 'method') return app.layouts.length + app.methods.findIndex((method) => method.id === selection.id);
		return app.layouts.findIndex((layout) => layout.id === selection.id);
	});

	async function created(selection: Selection) {
		app.creating = null;
		await app.refresh();
		app.select(selection);
	}
</script>

<GlassShell class="[--sidebar-width:260px]">
	{#if !app.focused}
		<Sidebar />
	{/if}
	<main class="glass-content">
		<PageStage {page} {order} scrolls={false}>
			{#if app.selection?.kind === 'view'}
				<LayoutView id={app.selection.id} />
			{:else if app.selection?.kind === 'layout'}
				<LayoutEditor id={app.selection.id} />
			{:else if app.selection?.kind === 'method'}
				<MethodEditor id={app.selection.id} />
			{:else}
				<Welcome />
			{/if}
		</PageStage>
	</main>
	<Toast toast={toast.current} ondismiss={toast.dismiss} onhold={toast.hold} onrelease={toast.release} />
</GlassShell>

{#if app.creating?.kind === 'layout'}
	<NewLayoutDialog from={app.creating.from} oncreated={(layout) => void created({ kind: 'layout', id: layout.id })} onclose={() => (app.creating = null)} />
{:else if app.creating?.kind === 'method'}
	<NewMethodDialog oncreated={(method) => void created({ kind: 'method', id: method.id })} onclose={() => (app.creating = null)} />
{/if}
