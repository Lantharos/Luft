<script lang="ts" generics="T">
	import type { Component } from 'svelte';
	import Check from '@lucide/svelte/icons/check';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import { Popover, SearchField } from '@luft/ui';

	interface Props {
		icon: Component<{ size?: number }>;
		label: string;
		value: string;
		items: T[];
		key: (item: T) => string;
		name: (item: T) => string;
		detail?: (item: T) => string;
		selected: string;
		onchoose: (item: T) => void;
	}

	const SHOWN = 120;

	let { icon: Icon, label, value, items, key, name, detail, selected, onchoose }: Props = $props();

	let trigger = $state<HTMLButtonElement>();
	let search = $state<SearchField>();
	let open = $state(false);
	let query = $state('');
	let highlighted = $state(0);

	let matches = $derived.by(() => {
		const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
		return items
			.filter((item) => {
				const text = `${name(item)} ${detail?.(item) ?? ''} ${key(item)}`.toLowerCase();
				return words.every((word) => text.includes(word));
			})
			.slice(0, SHOWN);
	});

	function show() {
		query = '';
		highlighted = 0;
		open = true;
		queueMicrotask(() => search?.focus());
	}

	function choose(item: T) {
		open = false;
		trigger?.focus();
		onchoose(item);
	}

	function keydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') highlighted = Math.min(highlighted + 1, matches.length - 1);
		else if (event.key === 'ArrowUp') highlighted = Math.max(highlighted - 1, 0);
		else if (event.key === 'Enter' && matches[highlighted]) choose(matches[highlighted]);
		else return;
		event.preventDefault();
	}

	$effect(() => {
		void query;
		highlighted = 0;
	});
</script>

<button bind:this={trigger} type="button" class="picker" aria-haspopup="listbox" aria-expanded={open} onclick={show}>
	<span class="text-[var(--text-muted)]"><Icon size={20} /></span>
	<span class="flex min-w-0 flex-1 flex-col text-left">
		<span class="text-[12.5px] text-[var(--text-muted)]">{label}</span>
		<span class="truncate text-[15px] font-medium">{value}</span>
	</span>
	<ChevronDown size={17} class="flex-none text-[var(--text-muted)]" />
</button>

{#if open && trigger}
	<Popover anchor={trigger} {label} role="listbox" maxHeight={340} onclose={() => (open = false)}>
		<div class="sticky top-0 z-10 bg-[var(--popover)] p-1 pb-2">
			<SearchField bind:this={search} bind:value={query} label="Search" onkeydown={keydown} />
		</div>
		{#each matches as item, index (key(item))}
			<button type="button" class="option" class:highlighted={index === highlighted} role="option" aria-selected={key(item) === selected} onpointerenter={() => (highlighted = index)} onclick={() => choose(item)}>
				<span class="flex min-w-0 flex-1 flex-col text-left">
					<span class="truncate">{name(item)}</span>
					{#if detail}
						<span class="truncate text-[12px] text-[var(--text-muted)]">{detail(item)}</span>
					{/if}
				</span>
				{#if key(item) === selected}
					<Check size={16} class="flex-none" />
				{/if}
			</button>
		{:else}
			<p class="px-3 py-4 text-[13px] text-[var(--text-muted)]">Nothing matches</p>
		{/each}
	</Popover>
{/if}

<style>
	.picker {
		display: flex;
		width: 100%;
		align-items: center;
		gap: 14px;
		border-radius: 16px;
		padding: 10px 14px;
		background: var(--surface);
		transition: background-color 160ms var(--ease);
	}

	.picker:hover {
		background: var(--surface-hover);
	}

	.option {
		display: flex;
		align-items: center;
		gap: 10px;
		border-radius: 12px;
		padding: 7px 10px;
		font-size: 13.5px;
	}

	.option.highlighted {
		background: var(--surface-hover);
	}
</style>
