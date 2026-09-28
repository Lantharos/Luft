<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import Row from '$lib/components/controls/Row.svelte';
	import Section from '$lib/components/controls/Section.svelte';
	import Switch from '$lib/components/controls/Switch.svelte';
	import AddStartupDialog from './AddStartupDialog.svelte';
	import AppIcon from './AppIcon.svelte';
	import ItemRow from './ItemRow.svelte';
	import { addStartup, setStartup, startupApps, type StartupApp } from './api';

	let apps = $state<StartupApp[]>([]);
	let adding = $state(false);

	async function load() {
		apps = await startupApps();
	}

	async function toggle(app: StartupApp, enabled: boolean) {
		app.enabled = enabled;
		try {
			await setStartup(app.id, enabled);
		} finally {
			await load();
		}
	}

	async function add(id: string) {
		adding = false;
		await addStartup(id);
		await load();
	}

	void load();
</script>

<Section title="Startup" description="These apps open when you sign in">
	{#each apps as app (app.id)}
		<ItemRow title={app.name}>
			{#snippet leading()}
				<AppIcon icon={app.icon} />
			{/snippet}
			<Switch label="Open {app.name} when you sign in" checked={app.enabled} onchange={(enabled) => toggle(app, enabled)} />
		</ItemRow>
	{/each}
	<Row title="Add app" icon={Plus} onclick={() => (adding = true)} />
</Section>

{#if adding}
	<AddStartupDialog exclude={apps.filter((app) => app.enabled).map((app) => app.id)} onadd={add} onclose={() => (adding = false)} />
{/if}
