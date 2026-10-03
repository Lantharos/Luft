<script lang="ts">
	import { typedLevel } from '$lib/keyboard/board';
	import { describe, LEVEL_NAMES, shown } from '$lib/keyboard/describe';
	import type { DeadKey, Levels } from '$lib/layout/api';

	interface Props {
		levels: Levels;
		level: number;
		thirdLevel: boolean;
		dead: DeadKey[];
	}

	let { levels, level, thirdLevel, dead }: Props = $props();

	let typed = $derived(levels.map((_, index) => levels[typedLevel(levels, index)]));
	let names = $state<string[]>(['', '', '', '']);
	let shownLevels = $derived(thirdLevel ? [0, 1, 2, 3] : [0, 1]);

	$effect(() => {
		const current = typed;
		void Promise.all(current.map((symbol) => describe(symbol, dead))).then((described) => {
			if (current === typed) names = described;
		});
	});
</script>

<div class="grid gap-2" style:grid-template-columns="repeat({shownLevels.length}, minmax(0, 1fr))">
	{#each shownLevels as index (index)}
		{@const symbol = typed[index]}
		<div class="slot" class:current={level === index} aria-label="{LEVEL_NAMES[index]}: {names[index]}">
			<span class="text-[12px] text-[var(--text-muted)]">{LEVEL_NAMES[index]}</span>
			<span class="glyph" class:dead={symbol.kind === 'dead'} class:named={symbol.kind === 'function'}>{shown(symbol)}</span>
			<span class="truncate text-[12px] text-[var(--text-soft)] first-letter:uppercase">{names[index]}</span>
		</div>
	{/each}
</div>

<style>
	.slot {
		display: flex;
		min-width: 0;
		flex-direction: column;
		gap: 6px;
		border-radius: 16px;
		background: var(--surface);
		padding: 12px 14px;
		transition: box-shadow 140ms var(--ease);
	}

	.slot.current {
		box-shadow: inset 0 0 0 1.5px var(--accent);
	}

	.glyph {
		height: 38px;
		overflow: hidden;
		font-size: 30px;
		line-height: 38px;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.dead {
		color: var(--secondary);
	}

	.named {
		font-size: 15px;
	}
</style>
