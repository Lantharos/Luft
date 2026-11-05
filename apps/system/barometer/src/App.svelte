<script lang="ts">
	import { appearance, GlassShell, page, Toast } from '@luft/ui';
	import { onMount } from 'svelte';
	import ResourcePage from '#lib/resources/ResourcePage.svelte';
	import Sidebar from '#lib/shell/Sidebar.svelte';
	import { app } from '#lib/state/app.svelte.js';
	import { notices } from '#lib/state/notices.svelte.js';
	import { monitor } from '#lib/state/monitor.svelte.js';
	import DialogHost from '#lib/tasks/actions/DialogHost.svelte';
	import AppsView from '#lib/tasks/apps/AppsView.svelte';
	import ProcessesView from '#lib/tasks/processes/ProcessesView.svelte';

	onMount(() => {
		void app.start();
	});

	$effect(() => {
		document.documentElement.dataset.scheme = appearance.scheme;
	});
</script>

<GlassShell>
	<Sidebar />
	<main class="glass-content">
		{#key app.page}
			<div class="flex min-h-0 flex-1 flex-col" in:page>
				{#if app.page === 'apps'}
					<AppsView />
				{:else if app.page === 'processes'}
					<ProcessesView />
				{:else if monitor.devices}
					<ResourcePage page={app.page} devices={monitor.devices} />
				{/if}
			</div>
		{/key}
	</main>
</GlassShell>

<DialogHost />
<Toast
	class="bottom-5 left-[calc(var(--sidebar-width)_+_(100vw_-_var(--sidebar-width))_/_2)]"
	toast={notices.current}
	dismissible
	ondismiss={notices.dismiss}
	onhold={notices.hold}
	onrelease={notices.release}
/>
