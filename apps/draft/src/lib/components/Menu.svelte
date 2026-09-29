<script lang="ts">
	import { ContextMenu, MenuItem, MenuSeparator } from '@luft/ui';
	import { useApp } from '$lib/context';

	const app = useApp();
	let menu = $derived(app.menus.current);

	function dismiss(event: Event) {
		if (event.target instanceof Element && event.target.closest('[role="menu"]')) return;
		app.menus.close();
	}
</script>

<svelte:window onpointerdown={dismiss} onblur={() => app.menus.close()} />

{#if menu}
	{#key menu}
		<ContextMenu at={menu.at} onclose={() => app.menus.close()}>
			{#each menu.groups as group, index (index)}
				{#if index > 0}
					<MenuSeparator />
				{/if}
				{#each group as entry (entry.label)}
					<MenuItem
						danger={entry.danger}
						onclick={() => {
							app.menus.close();
							entry.run();
						}}
					>
						{entry.label}
					</MenuItem>
				{/each}
			{/each}
		</ContextMenu>
	{/key}
{/if}
