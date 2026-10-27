<script lang="ts">
	import { AppIcon, MenuButton, MenuItem } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { App } from '#lib/bindings.js';
	import { openWith } from '#lib/bridge/index.js';

	let { path }: { path: string } = $props();

	let apps = $state.raw<App[] | null>(null);

	$effect(() => {
		apps = null;
		commands.otherApps({ path }).then((found) => (apps = found), () => (apps = []));
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
						void openWith(path, app.id);
					}}
				>
					<AppIcon icon={app.icon} id={app.id} size={20} />
					<span class="truncate">{app.name}</span>
				</MenuItem>
			{/each}
		{/snippet}
	</MenuButton>
{/if}
