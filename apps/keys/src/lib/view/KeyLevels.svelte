<script lang="ts">
	import { tooltip } from '@luft/ui';
	import { typedLevel } from '#lib/keyboard/board.js';
	import { describe, LEVEL_NAMES, LEVEL_SHORT_NAMES, shown } from '#lib/keyboard/describe.js';
	import type { DeadKey, Levels } from '#lib/layout/api.js';

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

<div class="flex justify-center gap-2">
	{#each shownLevels as index (index)}
		{@const symbol = typed[index]}
		<div class="slot" class:current={level === index} role="img" aria-label="{LEVEL_NAMES[index]}: {names[index]}" {@attach tooltip(names[index])}>
			<span class="glyph" class:dead={symbol.kind === 'dead'} class:named={symbol.kind === 'function'}>{shown(symbol)}</span>
			<span class="level">{LEVEL_SHORT_NAMES[index]}</span>
		</div>
	{/each}
</div>

<style>
	.slot {
		display: flex;
		width: 96px;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		border-radius: 16px;
		padding: 10px 8px 8px;
		transition: background-color 140ms var(--ease);
	}

	.slot.current {
		background: var(--surface-hover);
	}

	.glyph {
		height: 34px;
		max-width: 100%;
		overflow: hidden;
		font-size: 28px;
		line-height: 34px;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.level {
		font-size: 12px;
		color: var(--text-muted);
	}

	.current .level {
		color: var(--text-soft);
	}

	.dead {
		color: var(--secondary);
	}

	.named {
		font-size: 14px;
	}
</style>
