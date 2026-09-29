<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import type { SearchResult } from '$lib/features/types';
	import { entryIcon } from '$lib/utils/file-kinds';
	import { parentPath } from '$lib/utils/paths';

	interface Props {
		results: SearchResult[];
		root: string;
		highlighted: number;
		onhighlight: (index: number) => void;
		onreveal: (result: SearchResult) => void;
		onopen: (result: SearchResult) => void;
	}

	let { results, root, highlighted, onhighlight, onreveal, onopen }: Props = $props();
	let list = $state<HTMLOListElement>();

	$effect(() => {
		list?.children[highlighted]?.scrollIntoView({ block: 'nearest' });
	});

	function location(result: SearchResult) {
		const folder = parentPath(result.path);
		if (folder === root) return '';
		return folder.startsWith(`${root}/`) ? folder.slice(root.length + 1) : folder;
	}
</script>

<ol bind:this={list} class="flex flex-col" role="listbox" aria-label="Results">
	{#each results as result, index (result.path)}
		<li role="option" aria-selected={index === highlighted}>
			<button
				type="button"
				class={['result', index === highlighted && 'highlighted']}
				onpointermove={() => onhighlight(index)}
				onclick={() => onreveal(result)}
				ondblclick={() => onopen(result)}
			>
				<span class="icon"><Icon name={entryIcon(result)} size={17} /></span>
				<span class="min-w-0 flex-1">
					<span class="block truncate text-[14px] text-[var(--text)]">{result.name}</span>
					{#if result.snippet}
						<span class="block truncate text-[12px] text-[var(--text-soft)]">{result.snippet}</span>
					{/if}
				</span>
				<span class="max-w-[40%] shrink-0 truncate text-[12px] text-[var(--text-muted)]" title={parentPath(result.path)}>
					{location(result)}
				</span>
			</button>
		</li>
	{/each}
</ol>

<style>
	.result {
		display: flex;
		min-height: 44px;
		width: 100%;
		align-items: center;
		gap: 12px;
		border-radius: 14px;
		padding: 6px 10px;
		text-align: left;
		transition: background-color 120ms var(--ease);
	}

	.highlighted {
		background: var(--surface-hover);
	}

	.icon {
		display: grid;
		height: 30px;
		width: 30px;
		flex: none;
		place-items: center;
		border-radius: 10px;
		background: var(--control);
		color: var(--text-soft);
	}
</style>
