<script lang="ts">
	import { appearance, GlassShell, PageStage, Toast } from '@luft/ui';
	import { onMount } from 'svelte';
	import { resources } from '#lib/resources/registry.js';
	import ResourcePage from '#lib/resources/ResourcePage.svelte';
	import Sidebar from '#lib/shell/Sidebar.svelte';
	import { app, TASKS } from '#lib/state/app.svelte.js';
	import { notices } from '#lib/state/notices.svelte.js';
	import { monitor } from '#lib/state/monitor.svelte.js';
	import { settings } from '#lib/state/settings.svelte.js';
	import DialogHost from '#lib/tasks/actions/DialogHost.svelte';
	import TasksView from '#lib/tasks/TasksView.svelte';

	let order = $derived(app.page === TASKS ? 0 : 1 + (monitor.devices ? resources(monitor.devices, settings.value.showVirtual).findIndex((resource) => resource.id === app.page) : 0));

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
		<PageStage page={app.page} {order} scrolls={false}>
			{#if app.page === TASKS}
				<TasksView />
			{:else if monitor.devices}
				<ResourcePage page={app.page} devices={monitor.devices} />
			{/if}
		</PageStage>
	</main>
</GlassShell>

<DialogHost />
<Toast
	toast={notices.current}
	dismissible
	ondismiss={notices.dismiss}
	onhold={notices.hold}
	onrelease={notices.release}
/>
