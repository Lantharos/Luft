<script lang="ts">
	import { appearance, GlassShell, PageMotion, Toast } from '@luft/ui';
	import { onMount } from 'svelte';
	import { resources } from '#lib/resources/registry.js';
	import ResourcePage from '#lib/resources/ResourcePage.svelte';
	import PageSwitch from '#lib/shell/PageSwitch.svelte';
	import Sidebar from '#lib/shell/Sidebar.svelte';
	import { app, TASKS } from '#lib/state/app.svelte.js';
	import { notices } from '#lib/state/notices.svelte.js';
	import { monitor } from '#lib/state/monitor.svelte.js';
	import { settings } from '#lib/state/settings.svelte.js';
	import DialogHost from '#lib/tasks/actions/DialogHost.svelte';
	import TasksView from '#lib/tasks/TasksView.svelte';

	const motion = new PageMotion();

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
	<main class="glass-content relative isolate">
		<div class="pointer-events-none absolute inset-0 overflow-hidden" {@attach motion.layer}></div>
		{#key app.page}
			<PageSwitch {motion} {order}>
				{#if app.page === TASKS}
					<TasksView />
				{:else if monitor.devices}
					<ResourcePage page={app.page} devices={monitor.devices} />
				{/if}
			</PageSwitch>
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
