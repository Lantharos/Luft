<script lang="ts">
	import { t } from '@luft/i18n';
	import { edgeOf, isVerticalEdge, layIslands, PRESETS, type Arrangement, type PresetName } from '@luft/ui/taskbar';
	import { PRESETS as NAMES } from './options';

	interface Props {
		current: PresetName | null;
		onselect: (preset: PresetName) => void;
	}

	let { current, onselect }: Props = $props();

	const WIDTH = 72;
	const HEIGHT = 45;
	const THICKNESS = 5;
	const MARGIN = 3;
	const LENGTHS: Record<string, number> = { start: 5, dock: 22, tray: 3, status: 7, clock: 6 };

	function sketch(arrangement: Arrangement, joined: boolean) {
		const length = (elements: string[]) => elements.reduce((sum, element) => sum + LENGTHS[element], 0);
		const margin = joined ? 0 : MARGIN;
		const islands = layIslands(
			arrangement.map(({ spot, elements }) => ({ spot, length: length(elements) })),
			{ width: WIDTH, height: HEIGHT, thickness: THICKNESS, margin, rightToLeft: false }
		);
		const bar = joined ? islands.find((island) => island.spot === arrangement[0].spot) : null;
		return { islands, bar: bar && (isVerticalEdge(edgeOf(bar.spot)) ? { x: bar.x, y: 0, width: THICKNESS, height: HEIGHT } : { x: 0, y: bar.y, width: WIDTH, height: THICKNESS }) };
	}
</script>

<div class="presets" role="radiogroup" aria-label={t('settings-taskbar-presets')}>
	{#each NAMES as preset (preset.value)}
		{@const { arrangement, style } = PRESETS[preset.value]}
		{@const { islands, bar } = sketch(arrangement, style === 'bar')}
		<button type="button" role="radio" class="preset" class:selected={current === preset.value} aria-checked={current === preset.value} onclick={() => onselect(preset.value)}>
			<svg viewBox="0 0 {WIDTH} {HEIGHT}" width={WIDTH} height={HEIGHT} aria-hidden="true">
				<rect class="screen" width={WIDTH} height={HEIGHT} rx="6" />
				{#if bar}
					<rect class="part" x={bar.x} y={bar.y} width={bar.width} height={bar.height} />
				{:else}
					{#each islands as island (island.spot)}
						<rect class="part" x={island.x} y={island.y} width={island.width} height={island.height} rx="2.5" />
					{/each}
				{/if}
			</svg>
			<span>{t(preset.label)}</span>
		</button>
	{/each}
</div>

<style>
	.presets {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.preset {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		padding: 6px 6px 8px;
		border-radius: 14px;
		font-size: 12px;
		color: var(--text-muted);
		transition:
			background-color var(--motion-tap) var(--ease-decelerate),
			color var(--motion-tap) var(--ease-decelerate);
	}

	.preset:hover {
		background: var(--control);
	}

	.preset.selected {
		color: var(--text);
	}

	.screen {
		fill: var(--control);
		transition: fill var(--motion-tap) var(--ease-decelerate);
	}

	.preset:hover .screen {
		fill: var(--content);
	}

	.part {
		fill: var(--text-muted);
	}

	.selected .part {
		fill: var(--accent);
	}

	.selected .screen {
		stroke: var(--text);
		stroke-width: 1.5;
	}
</style>
