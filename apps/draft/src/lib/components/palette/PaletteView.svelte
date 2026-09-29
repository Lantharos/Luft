<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import { useApp } from '$lib/context';
	import type { PaletteItem } from '$lib/palette/palette.svelte';
	import Highlight from './Highlight.svelte';

	const app = useApp();
	let palette = $derived(app.palette);
	let items = $derived(palette.open && palette.source ? palette.source.items(palette.query) : []);
	let selected = $state(0);
	let list = $state<HTMLDivElement>();

	$effect(() => {
		void items;
		selected = Math.max(0, items.findIndex((item) => item.checked));
	});

	$effect(() => {
		list?.children[selected]?.scrollIntoView({ block: 'nearest' });
	});

	function focusInput(input: HTMLInputElement) {
		input.focus();
		const end = input.value.length;
		input.setSelectionRange(end, end);
	}

	function close() {
		palette.close();
		app.workspace.editor.focus();
	}

	function choose(item: PaletteItem | undefined) {
		if (!item) return;
		palette.close();
		app.workspace.editor.focus();
		item.run();
	}

	function keydown(event: KeyboardEvent) {
		const steps: Record<string, number> = { ArrowDown: 1, ArrowUp: -1, PageDown: 8, PageUp: -8 };
		if (event.key in steps && items.length) selected = Math.min(items.length - 1, Math.max(0, selected + steps[event.key]));
		else if (event.key === 'Enter') choose(items[selected]);
		else if (event.key === 'Escape') close();
		else return;
		event.preventDefault();
	}
</script>

{#if palette.open && palette.source}
	<div class="palette-backdrop" role="presentation" onpointerdown={close}></div>
	<div class="palette" role="dialog" aria-label={palette.source.placeholder}>
		<input
			{@attach focusInput}
			class="palette-input"
			placeholder={palette.source.placeholder}
			aria-label={palette.source.placeholder}
			spellcheck="false"
			autocomplete="off"
			bind:value={palette.query}
			onkeydown={keydown}
		/>
		{#if items.length}
			<div bind:this={list} class="palette-list soft-scroll" role="listbox">
				{#each items as item, index (item.key)}
					<button
						type="button"
						role="option"
						aria-selected={index === selected}
						class={['palette-item', index === selected && 'is-selected']}
						onpointermove={() => (selected = index)}
						onclick={() => choose(item)}
					>
						<span class="min-w-0 flex-none truncate text-[var(--text)]"><Highlight text={item.label} matches={item.labelMatches} /></span>
						{#if item.detail}
							<span class="min-w-0 flex-1 truncate text-[12px] text-[var(--text-muted)]"><Highlight text={item.detail} matches={item.detailMatches} /></span>
						{:else}
							<span class="flex-1"></span>
						{/if}
						{#if item.checked}
							<Check size={15} class="flex-none text-[var(--accent)]" />
						{/if}
						{#if item.hint}
							<span class="flex-none text-[12px] text-[var(--text-muted)]">{item.hint}</span>
						{/if}
					</button>
				{/each}
			</div>
		{:else if palette.source.empty && palette.query.trim()}
			<p class="palette-empty">{palette.source.empty}</p>
		{/if}
	</div>
{/if}

<style>
	.palette-backdrop {
		position: fixed;
		inset: 0;
		z-index: 60;
	}

	.palette {
		position: fixed;
		top: 58px;
		left: 50%;
		z-index: 61;
		display: flex;
		width: min(600px, calc(100vw - 48px));
		max-height: min(480px, calc(100vh - 120px));
		flex-direction: column;
		transform: translateX(-50%);
		border-radius: 20px;
		background: var(--popover);
		padding: 6px;
		box-shadow: 0 20px 56px var(--shadow-soft);
		animation: palette-in 160ms var(--ease);
	}

	.palette-input {
		height: 42px;
		flex: none;
		border-radius: 14px;
		background: transparent;
		padding-inline: 14px;
		font-size: 14.5px;
		outline: none;
	}

	.palette-input::placeholder {
		color: var(--text-muted);
	}

	.palette-list {
		display: flex;
		min-height: 0;
		flex-direction: column;
		overflow-y: auto;
		padding-top: 4px;
		box-shadow: 0 -1px 0 var(--hairline);
	}

	.palette-item {
		display: flex;
		min-height: 36px;
		flex: none;
		align-items: center;
		gap: 10px;
		border-radius: 12px;
		padding-inline: 12px;
		font-size: 13px;
		text-align: left;
	}

	.palette-item.is-selected {
		background: var(--surface-hover);
	}

	.palette-empty {
		padding: 10px 14px 12px;
		color: var(--text-muted);
		font-size: 13px;
	}

	@keyframes palette-in {
		from {
			opacity: 0;
			transform: translate(-50%, -6px);
		}
	}
</style>
