<script lang="ts">
	import { AppIcon, MenuButton, MenuItem } from '@luft/ui';
	import type { App } from '#lib/api.js';
	import * as api from '#lib/api.js';

	let { path }: { path: string } = $props();

	let apps = $state.raw<App[] | null>(null);

	$effect(() => {
		apps = null;
		api.otherApps(path).then((found) => (apps = found), () => (apps = []));
	});
</script>

{#if apps?.length}
	<MenuButton class="button" label="Open with another app" align="start">
		{#snippet trigger()}Open with…{/snippet}
		{#snippet children(close)}
			{#each apps ?? [] as app (app.id)}
				<MenuItem
					onclick={() => {
						close();
						void api.openWith(path, app.id);
					}}
				>
					<AppIcon icon={app.icon} id={app.id} size={20} />
					<span class="truncate">{app.name}</span>
				</MenuItem>
			{/each}
		{/snippet}
	</MenuButton>
{/if}
