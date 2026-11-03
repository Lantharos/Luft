<script lang="ts">
	import { MenuItem } from '@luft/ui';
	import Check from '@lucide/svelte/icons/check';
	import MoreMenu from '#lib/shell/MoreMenu.svelte';
	import { STYLE_NAMES, STYLES, visualizer } from './visualizer/settings.svelte';
</script>

<MoreMenu>
	{#snippet children(close)}
		{#each STYLES as style (style)}
			{@const chosen = visualizer.on && visualizer.style === style}
			<MenuItem checked={chosen} onclick={() => (close(), visualizer.choose(style))}>
				<span class="flex-1">{STYLE_NAMES[style]}</span>
				{#if chosen}<Check size={15} class="flex-none" />{/if}
			</MenuItem>
		{/each}
	{/snippet}
</MoreMenu>
