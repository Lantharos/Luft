<script lang="ts">
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import { MenuButton, MenuItem } from '@luft/ui';
	import type { LayoutEditor } from '../editor.svelte';
	import { issues, type Target } from '../issues';

	interface Props {
		editor: LayoutEditor;
	}

	let { editor }: Props = $props();

	let found = $derived(issues(editor.layout, editor.geometry, editor.usesThirdLevel));

	function open(target: Target) {
		editor.tab = target.tab;
		if (target.tab === 'keys') editor.select(target.key, target.level);
		else if (target.tab === 'dead') editor.chosenDead = target.keysym;
	}
</script>

{#if found.length}
	<MenuButton label="Worth a look" class="issues-button" align="end" minWidth={280}>
		{#snippet trigger()}
			<CircleAlert size={16} />
			<span>{found.length}</span>
		{/snippet}
		{#snippet children(close)}
			{#each found as issue (issue.id)}
				<MenuItem
					onclick={() => {
						close();
						open(issue.target);
					}}>{issue.text}</MenuItem
				>
			{/each}
		{/snippet}
	</MenuButton>
{/if}

<style>
	:global(.issues-button) {
		display: inline-flex;
		height: 32px;
		align-items: center;
		gap: 6px;
		border-radius: var(--radius-pill);
		padding-inline: 10px;
		font-size: 13px;
		font-weight: 500;
		color: var(--text-muted);
		transition:
			background-color 160ms var(--ease),
			color 160ms var(--ease);
	}

	:global(.issues-button:hover),
	:global(.issues-button[aria-expanded='true']) {
		background: var(--surface-hover);
		color: var(--text);
	}
</style>
