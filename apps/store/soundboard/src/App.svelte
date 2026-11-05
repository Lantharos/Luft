<script lang="ts">
	import { onMount } from 'svelte';
	import { appearance, GlassShell, Toast } from '@luft/ui';
	import BoardView from '#lib/components/BoardView.svelte';
	import Menus from '#lib/components/Menus.svelte';
	import SoundEditor from '#lib/components/SoundEditor.svelte';
	import Sidebar from '#lib/components/Sidebar.svelte';
	import { app } from '#lib/state/app.svelte.js';
	import { toast } from '#lib/state/toast.svelte.js';

	onMount(() => void app.start());

	$effect(() => {
		document.documentElement.dataset.scheme = appearance.scheme;
	});
</script>

<GlassShell class="[--sidebar-width:280px]">
	<Sidebar />
	<BoardView />
</GlassShell>

<Menus />

{#if app.editing}
	{#key app.editing.id}
		<SoundEditor sound={app.editing} onclose={() => (app.editing = null)} />
	{/key}
{/if}

<Toast toast={toast.current} ondismiss={toast.dismiss} onhold={toast.hold} onrelease={toast.release} />
