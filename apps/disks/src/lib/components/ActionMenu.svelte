<script lang="ts">
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import { MenuButton, MenuItem, MenuSeparator } from '@luft/ui';
	import type { Action } from './actions';

	interface Props {
		label: string;
		groups: Action[][];
		disabled?: boolean;
	}

	let { label, groups, disabled = false }: Props = $props();

	let filled = $derived(groups.filter((group) => group.length > 0));
</script>

{#if filled.length}
	<MenuButton {label} class="icon-button" align="end" minWidth={230} {disabled}>
		{#snippet trigger()}
			<Ellipsis size={18} />
		{/snippet}
		{#snippet children(close)}
			{#each filled as group, index (index)}
				{#if index > 0}
					<MenuSeparator />
				{/if}
				{#each group as action (action.label)}
					<MenuItem danger={action.danger} checked={action.checked} onclick={() => (close(), action.run())}>{action.label}</MenuItem>
				{/each}
			{/each}
		{/snippet}
	</MenuButton>
{/if}
