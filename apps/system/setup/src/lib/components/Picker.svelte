<script lang="ts" generics="T">
	import type { Component } from 'svelte';
	import Check from '@lucide/svelte/icons/check';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import { t } from '@luft/i18n';
	import { SearchField, topLayer } from '@luft/ui';

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

	interface Sheet {
		left: number;
		top: number;
		width: number;
		height: number;
	}

	const SHOWN = 120;
	const WINDOW_MARGIN = 16;

	let { icon: Icon, label, value, items, key, name, detail, selected, onchoose }: Props = $props();

	let trigger = $state<HTMLButtonElement>();
	let list = $state<HTMLDivElement>();
	let search = $state<SearchField>();
	let sheet = $state<Sheet | null>(null);
	let query = $state('');
	let highlighted = $state(0);

	let matches = $derived.by(() => {
		const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
		if (words.length === 0) return items;
		return items
			.filter((item) => {
				const text = `${name(item)} ${detail?.(item) ?? ''} ${key(item)}`.toLowerCase();
				return words.every((word) => text.includes(word));
			})
			.slice(0, SHOWN);
	});

	function secondLine(item: T) {
		const second = detail?.(item);
		return second && second !== name(item) ? second : '';
	}

	function reveal(block: ScrollLogicalPosition) {
		queueMicrotask(() => list?.querySelector('.highlighted')?.scrollIntoView({ block }));
	}

	function show() {
		const own = trigger!.getBoundingClientRect();
		const { top } = (trigger!.closest('.soft-scroll') ?? trigger!).getBoundingClientRect();
		sheet = { left: own.left, top, width: own.width, height: innerHeight - top - WINDOW_MARGIN };
		query = '';
		queueMicrotask(() => search?.focus());
	}

	function close() {
		sheet = null;
		trigger?.focus();
	}

	function choose(item: T) {
		close();
		onchoose(item);
	}

	$effect(() => {
		if (!sheet) return;
		highlighted = query ? 0 : Math.max(items.findIndex((item) => key(item) === selected), 0);
		reveal('center');
	});

	function keydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') highlighted = Math.min(highlighted + 1, matches.length - 1);
		else if (event.key === 'ArrowUp') highlighted = Math.max(highlighted - 1, 0);
		else if (event.key === 'Enter' && matches[highlighted]) choose(matches[highlighted]);
		else if (event.key === 'Escape') close();
		else return;
		event.preventDefault();
		event.stopPropagation();
		reveal('nearest');
	}
</script>

<svelte:window onresize={() => sheet && close()} />

<button bind:this={trigger} type="button" class="picker" aria-haspopup="listbox" aria-expanded={!!sheet} onclick={show}>
	<span class="text-[var(--text-muted)]"><Icon size={20} /></span>
	<span class="flex min-w-0 flex-1 flex-col text-left">
		<span class="text-[12.5px] text-[var(--text-muted)]">{label}</span>
		<span class="truncate text-[15px] font-medium">{value}</span>
	</span>
	<ChevronDown size={17} class="flex-none text-[var(--text-muted)]" />
</button>

{#if sheet}
	<div {@attach topLayer} class="backdrop" role="presentation" onpointerdown={close}></div>
	<div
		{@attach topLayer}
		class="sheet"
		role="dialog"
		aria-label={label}
		style:left="{sheet.left}px"
		style:top="{sheet.top}px"
		style:width="{sheet.width}px"
		style:height="{sheet.height}px"
	>
		<div class="p-1 pb-2">
			<SearchField bind:this={search} bind:value={query} label={t('setup-picker-search')} onkeydown={keydown} />
		</div>
		<div bind:this={list} class="soft-scroll flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto" role="listbox" aria-label={label}>
			{#each matches as item, index (key(item))}
				{@const second = secondLine(item)}
				<button
					type="button"
					tabindex="-1"
					class="option"
					class:highlighted={index === highlighted}
					role="option"
					aria-selected={key(item) === selected}
					onpointerenter={() => (highlighted = index)}
					onclick={() => choose(item)}
				>
					<span class="flex min-w-0 flex-1 flex-col text-left">
						<span class="truncate">{name(item)}</span>
						{#if second}
							<span class="truncate text-[12px] text-[var(--text-muted)]">{second}</span>
						{/if}
					</span>
					{#if key(item) === selected}
						<Check size={16} class="flex-none" />
					{/if}
				</button>
			{:else}
				<p class="px-3 py-4 text-[13px] text-[var(--text-muted)]">{t('setup-picker-no-match')}</p>
			{/each}
		</div>
	</div>
{/if}

<style>
	.picker {
		display: flex;
		width: 100%;
		align-items: center;
		gap: 14px;
		border-radius: 16px;
		padding: 10px 14px;
		background: var(--control);
		transition: background-color var(--motion-tap) var(--ease-decelerate);
	}

	.picker:hover,
	.picker[aria-expanded='true'] {
		background: var(--control-hover);
	}

	.backdrop {
		position: fixed;
		inset: 0;
		width: auto;
		height: auto;
		margin: 0;
		border: 0;
		padding: 0;
		background: transparent;
	}

	.sheet {
		position: fixed;
		inset: auto;
		display: flex;
		margin: 0;
		border: 0;
		color: inherit;
		flex-direction: column;
		padding: 6px;
		border-radius: 18px;
		background: var(--popover);
		box-shadow: 0 12px 40px var(--shadow-soft);
		animation: open var(--motion-standard) var(--ease-decelerate);
	}

	@keyframes open {
		from {
			opacity: 0;
			transform: translateY(-4px) scale(0.98);
		}
	}

	.option {
		display: flex;
		flex: none;
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
