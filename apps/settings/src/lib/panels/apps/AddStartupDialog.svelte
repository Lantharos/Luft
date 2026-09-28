<script lang="ts">
	import { AppIcon, Dialog, SearchField } from '@luft/ui';
	import { installedApps, matches, type App } from './api';

	interface Props {
		exclude: string[];
		onadd: (id: string) => void;
		onclose: () => void;
	}

	let { exclude, onadd, onclose }: Props = $props();

	let apps = $state<App[]>([]);
	let query = $state('');

	let shown = $derived(apps.filter((app) => !exclude.includes(app.id) && matches(app, query)));

	void installedApps().then((list) => (apps = list));
</script>

<Dialog title="Add a startup app" description="Choose an app to open every time you sign in." {onclose}>
	<SearchField label="Search apps" bind:value={query} />
	<div class="list soft-scroll">
		{#each shown as app (app.id)}
			<button type="button" class="app" onclick={() => onadd(app.id)}>
				<AppIcon icon={app.icon} size={28} />
				<span class="truncate">{app.name}</span>
			</button>
		{:else}
			{#if apps.length}
				<p class="empty">No apps match your search</p>
			{/if}
		{/each}
	</div>
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>Cancel</button>
	{/snippet}
</Dialog>

<style>
	.list {
		display: flex;
		height: 320px;
		flex-direction: column;
		gap: 2px;
		overflow-y: auto;
		margin-inline: -6px;
	}

	.app {
		display: flex;
		min-height: 44px;
		flex: none;
		align-items: center;
		gap: 12px;
		border-radius: 12px;
		padding-inline: 8px;
		text-align: left;
		font-size: 13.5px;
		color: var(--text-soft);
		transition: background-color 160ms var(--ease), color 160ms var(--ease);
	}

	.app:hover {
		background: var(--surface-hover);
		color: var(--text);
	}

	.empty {
		padding: 24px 8px;
		text-align: center;
		font-size: 13px;
		color: var(--text-muted);
	}
</style>
