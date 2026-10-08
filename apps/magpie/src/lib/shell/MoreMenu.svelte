<script lang="ts">
	import { MenuButton, MenuItem, MenuSeparator, tooltip } from '@luft/ui';
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import type { Snippet } from 'svelte';
	import * as api from '#lib/bridge/api.js';
	import { openFile } from '#lib/app/actions.js';
	import { library } from '#lib/library/library.svelte.js';

	let { children }: { children?: Snippet<[() => void]> } = $props();
</script>

<MenuButton class="icon-button" label="More" align="end" {@attach tooltip('More')}>
	{#snippet trigger()}<Ellipsis size={18} />{/snippet}
	{#snippet children(close)}
		{#if children}
			{@render children(close)}
			<MenuSeparator />
		{/if}
		{#if library.current}
			<MenuItem
				onclick={() => {
					close();
					void api.showInFolder(library.current!.path);
				}}>Show in folder</MenuItem
			>
		{/if}
		<MenuItem
			onclick={() => {
				close();
				void openFile();
			}}>Open…</MenuItem
		>
	{/snippet}
</MenuButton>
