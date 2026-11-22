<script lang="ts">
	import { t } from '@luft/i18n';
	import Plus from '@luft/symbols/icons/plus';
	import { Popover, SearchField, tooltip, VirtualScroller } from '@luft/ui';
	import { search } from '#lib/characters/characters.js';
	import { commands } from '#lib/bindings.js';
	import type { Character, Specials, Symbol } from '#lib/bindings.js';
	import { EMPTY } from '#lib/layout/levels.js';
	import { deadSymbol, standardName } from '../dead/table';
	import type { LayoutEditor } from '../editor.svelte';

	interface Props {
		editor: LayoutEditor;
		anchor: HTMLElement;
		onpick: (symbol: Symbol) => void;
		onclose: () => void;
	}

	let { editor, anchor, onpick, onclose }: Props = $props();

	const KEYSYM_NAME = /^[A-Za-z][A-Za-z0-9_]+$/;

	let query = $state('');
	let results = $state.raw<Character[]>([]);
	let named = $state<Symbol | null>(null);
	let extras = $state.raw<Specials | null>(null);
	let field = $state<SearchField>();

	void commands.layoutSpecials().then((loaded) => (extras = loaded));

	$effect(() => {
		const current = query;
		void search(current, true).then((found) => {
			if (current === query) results = found;
		});
		named = null;
		if (KEYSYM_NAME.test(current.trim())) {
			void commands.layoutDescribe({ keysym: current.trim() })
				.then((symbol) => {
					if (current === query) named = symbol;
				})
				.catch(() => {});
		}
	});

	$effect(() => {
		if (field) requestAnimationFrame(() => field?.focus());
	});

	async function newDead() {
		const keysym = await editor.addDead();
		const key = editor.dead(keysym);
		if (key) onpick(deadSymbol(key));
	}

	async function pickText(text: string) {
		onpick(await commands.layoutDescribe({ text }));
	}

	function keydown(event: KeyboardEvent) {
		if (event.key !== 'Enter') return;
		event.preventDefault();
		if (named) onpick(named);
		else if (results[0]) void pickText(results[0].text);
	}
</script>

<Popover {anchor} label={t('keys-picker')} role="dialog" minWidth={360} maxHeight={460} {onclose}>
	<div class="flex flex-col gap-3 p-1.5">
		<SearchField bind:this={field} label={t('keys-picker-search')} bind:value={query} onkeydown={keydown} />
		{#if extras && !query}
			<div class="flex flex-col gap-1.5">
				<h3 class="px-1 text-[12.5px] text-[var(--text-muted)]">{t('keys-picker-own-dead')}</h3>
				<div class="grid grid-cols-8 gap-1">
					{#each editor.layout.dead as key (key.keysym)}
						<button type="button" class="cell" aria-label={key.name} {@attach tooltip(key.name)} onclick={() => onpick(deadSymbol(key))}>{key.symbol}</button>
					{/each}
					<button type="button" class="cell add" aria-label={t('keys-dead-new')} {@attach tooltip(t('keys-dead-new'))} onclick={() => void newDead()}><Plus size={16} /></button>
				</div>
			</div>
			<div class="flex flex-col gap-1.5">
				<h3 class="px-1 text-[12.5px] text-[var(--text-muted)]">{t('keys-picker-standard-dead')}</h3>
				<div class="grid grid-cols-8 gap-1">
					{#each extras.dead as dead (dead.keysym)}
						<button type="button" class="cell" aria-label={t('keys-symbol-dead-standard', { name: standardName(dead.keysym) })} {@attach tooltip(standardName(dead.keysym))} onclick={() => onpick(dead)}>
							{dead.text}
						</button>
					{/each}
				</div>
			</div>
			<div class="flex gap-1">
				<button type="button" class="plain-button flex-1" onclick={() => extras && onpick(extras.compose)}>{t('keys-picker-compose')}</button>
				<button type="button" class="plain-button flex-1" onclick={() => onpick(EMPTY)}>{t('keys-symbol-nothing')}</button>
			</div>
		{/if}
		{#if named}
			<button type="button" class="option" onclick={() => named && onpick(named)}>
				<span class="glyph">{named.kind === 'character' ? named.text : '⌨'}</span>
				<span class="truncate">{t('keys-picker-named', { keysym: named.keysym })}</span>
			</button>
		{/if}
		<VirtualScroller class="hidden-scroll scroll-fade h-[240px]" items={results} key={(character) => character.text} layout={{ itemHeight: 40, gap: 2 }}>
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
		transition: background-color var(--motion-tap) var(--ease-decelerate);
	}

	.cell.add {
		color: var(--text-muted);
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
		transition: background-color var(--motion-tap) var(--ease-decelerate);
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
