<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import { tick } from 'svelte';
	import { Popover, SearchField, VirtualScroller } from '@luft/ui';
	import type { FontRole } from './api';
	import { fontLibrary } from './library.svelte';

	interface Props {
		role: FontRole;
		label: string;
		family: string;
		onerror: (message: string) => void;
	}

	let { role, label, family, onerror }: Props = $props();

	const ROW_HEIGHT = 40;
	const VISIBLE_ROWS = 8;
	const WIDTH = 320;

	let trigger = $state<HTMLButtonElement>();
	let field = $state<SearchField>();
	let list = $state<ReturnType<typeof VirtualScroller<string>>>();
	let open = $state(false);
	let search = $state('');
	let highlighted = $state(0);

	let defaultFamily = $derived(fontLibrary.defaults?.[role] ?? '');
	let choices = $derived.by(() => {
		const needle = search.trim().toLowerCase();
		const matches = (name: string) => !needle || name.toLowerCase().includes(needle);
		const families = (fontLibrary.families ?? [])
			.filter((candidate) => candidate.name !== defaultFamily && (role === 'interface' || candidate.monospace || candidate.name === family))
			.map((candidate) => candidate.name)
			.filter(matches);
		return defaultFamily && matches(defaultFamily) ? [defaultFamily, ...families] : families;
	});

	const face = (name: string) => `"${name.replace(/["\\]/g, '\\$&')}", var(--font-sans)`;

	async function show() {
		search = '';
		open = true;
		void fontLibrary.load();
		await tick();
		highlighted = Math.max(0, choices.indexOf(family));
		list?.scrollToIndex(highlighted, 'center');
		field?.focus();
	}

	function close() {
		open = false;
		trigger?.focus();
	}

	async function choose(name: string) {
		close();
		if (name === family) return;
		try {
			await fontLibrary.choose(role, name);
		} catch (reason) {
			onerror(reason instanceof Error ? reason.message : String(reason));
		}
	}

	function move(step: number) {
		if (!choices.length) return;
		highlighted = (highlighted + step + choices.length) % choices.length;
		list?.scrollToIndex(highlighted);
	}

	function keydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') move(1);
		else if (event.key === 'ArrowUp') move(-1);
		else if (event.key === 'Enter' && choices[highlighted]) void choose(choices[highlighted]);
		else return;
		event.preventDefault();
	}

	$effect(() => {
		void search;
		highlighted = 0;
	});
</script>

<button bind:this={trigger} type="button" class="trigger" class:open aria-haspopup="listbox" aria-expanded={open} aria-label={label} onclick={() => (open ? close() : show())}>
	<span class="truncate" style:font-family={face(family)}>{family}</span>
	<ChevronDown size={16} class="chevron" />
</button>

{#if open && trigger}
	<Popover anchor={trigger} {label} role="dialog" align="end" minWidth={WIDTH} maxHeight={ROW_HEIGHT * VISIBLE_ROWS + 64} onclose={close}>
		<SearchField bind:this={field} bind:value={search} label="Search fonts" onkeydown={keydown} />
		{#if choices.length}
			<VirtualScroller
				bind:this={list}
				class="soft-scroll mt-1"
				style="height: {Math.min(choices.length, VISIBLE_ROWS) * ROW_HEIGHT}px"
				role="listbox"
				aria-label={label}
				items={choices}
				key={(name) => name}
				layout={{ itemHeight: ROW_HEIGHT }}
			>
				{#snippet children(name, index)}
					<button
						type="button"
						role="option"
						aria-selected={name === family}
						class="option"
						class:highlighted={index === highlighted}
						onpointerenter={() => (highlighted = index)}
						onclick={() => choose(name)}
					>
						<span class="truncate" style:font-family={face(name)}>{name}</span>
						{#if name === defaultFamily}
							<span class="default">Default</span>
						{/if}
						{#if name === family}
							<Check size={16} class="ml-auto shrink-0" />
						{/if}
					</button>
				{/snippet}
			</VirtualScroller>
		{:else if fontLibrary.families}
			<p class="px-2.5 py-2 text-[13px] text-[var(--text-muted)]">No font is called that</p>
		{/if}
	</Popover>
{/if}

<style>
	.trigger {
		display: inline-flex;
		height: 36px;
		max-width: 260px;
		min-width: 160px;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		border-radius: var(--radius-pill);
		background: var(--control);
		padding-inline: 14px 12px;
		font-size: 13.5px;
		transition: background-color 160ms var(--ease);
	}

	.trigger:hover,
	.trigger.open {
		background: var(--control-hover);
	}

	.trigger :global(.chevron) {
		flex: none;
		color: var(--text-muted);
		transition: transform 200ms var(--ease);
	}

	.trigger.open :global(.chevron) {
		transform: rotate(180deg);
	}

	.option {
		display: flex;
		width: 100%;
		height: 40px;
		align-items: center;
		gap: 10px;
		border-radius: 12px;
		padding-inline: 10px;
		text-align: left;
		font-size: 15px;
		color: var(--text-soft);
	}

	.option.highlighted {
		background: var(--surface-hover);
		color: var(--text);
	}

	.option[aria-selected='true'] {
		color: var(--text);
	}

	.default {
		flex: none;
		font-size: 12px;
		color: var(--text-muted);
	}
</style>
