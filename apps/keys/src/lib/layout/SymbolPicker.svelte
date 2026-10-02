<script lang="ts">
	import { Popover, SearchField, tooltip, VirtualScroller } from '@luft/ui';
	import { search, type Character } from '$lib/characters/characters';
	import { describeKeysym, describeText, EMPTY, specials, type Specials, type Symbol } from './api';

	interface Props {
		anchor: HTMLElement;
		onpick: (symbol: Symbol) => void;
		onclose: () => void;
	}

	let { anchor, onpick, onclose }: Props = $props();

	const KEYSYM_NAME = /^[A-Za-z][A-Za-z0-9_]+$/;

	let query = $state('');
	let results = $state.raw<Character[]>([]);
	let named = $state<Symbol | null>(null);
	let extras = $state.raw<Specials | null>(null);
	let field = $state<SearchField>();

	void specials().then((loaded) => (extras = loaded));

	$effect(() => {
		const current = query;
		void search(current, true).then((found) => {
			if (current === query) results = found;
		});
		named = null;
		if (KEYSYM_NAME.test(current.trim())) {
			void describeKeysym(current.trim())
				.then((symbol) => {
					if (current === query) named = symbol;
				})
				.catch(() => {});
		}
	});

	$effect(() => {
		if (field) requestAnimationFrame(() => field?.focus());
	});

	async function pickText(text: string) {
		onpick(await describeText(text));
	}

	function keydown(event: KeyboardEvent) {
		if (event.key !== 'Enter') return;
		event.preventDefault();
		if (named) onpick(named);
		else if (results[0]) void pickText(results[0].text);
	}
</script>

<Popover {anchor} label="Choose a character" role="dialog" minWidth={360} maxHeight={460} {onclose}>
	<div class="flex flex-col gap-3 p-1.5">
		<SearchField bind:this={field} label="Search characters" bind:value={query} onkeydown={keydown} />
		{#if extras && !query}
			<div class="flex flex-col gap-1.5">
				<h3 class="px-1 text-[12.5px] text-[var(--text-muted)]">Dead keys</h3>
				<div class="grid grid-cols-8 gap-1">
					{#each extras.dead as dead (dead.keysym)}
						<button type="button" class="cell" aria-label={dead.keysym.replace('dead_', 'Dead ').replaceAll('_', ' ')} {@attach tooltip(dead.keysym.replace('dead_', '').replaceAll('_', ' '))} onclick={() => onpick(dead)}>
							{dead.text}
						</button>
					{/each}
				</div>
			</div>
			<div class="flex gap-1">
				<button type="button" class="plain-button flex-1" onclick={() => extras && onpick(extras.compose)}>Compose key</button>
				<button type="button" class="plain-button flex-1" onclick={() => onpick(EMPTY)}>Nothing</button>
			</div>
		{/if}
		{#if named}
			<button type="button" class="option" onclick={() => named && onpick(named)}>
				<span class="glyph">{named.kind === 'character' ? named.text : '⌨'}</span>
				<span class="truncate">The {named.keysym} key</span>
			</button>
		{/if}
		<VirtualScroller class="soft-scroll h-[240px]" items={results} key={(character) => character.text} layout={{ itemHeight: 40, gap: 2 }}>
			{#snippet children(character)}
				<button type="button" class="option" onclick={() => void pickText(character.text)}>
					<span class="glyph">{character.text}</span>
					<span class="truncate first-letter:uppercase">{character.name}</span>
				</button>
			{/snippet}
		</VirtualScroller>
	</div>
</Popover>

<style>
	.cell {
		display: grid;
		height: 36px;
		place-items: center;
		border-radius: 10px;
		font-size: 17px;
		color: var(--secondary);
		transition: background-color 120ms var(--ease);
	}

	.cell:hover {
		background: var(--surface-hover);
	}

	.option {
		display: flex;
		width: 100%;
		height: 40px;
		align-items: center;
		gap: 12px;
		border-radius: 12px;
		padding-inline: 8px;
		text-align: left;
		font-size: 13px;
		color: var(--text-soft);
		transition: background-color 120ms var(--ease);
	}

	.option:hover {
		background: var(--surface-hover);
		color: var(--text);
	}

	.glyph {
		display: grid;
		width: 28px;
		flex: none;
		place-items: center;
		font-size: 18px;
		color: var(--text);
	}
</style>
