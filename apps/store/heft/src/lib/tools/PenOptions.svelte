<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import { t } from '@luft/i18n';
	import { Popover, Segmented, Slider } from '@luft/ui';
	import { css, readableOn } from '#lib/ink/color.js';
	import { colorName } from './colors';
	import { SWATCHES, tools, type Preset } from './tools.svelte';

	let { anchor, preset, onclose }: { anchor: HTMLElement; preset: Preset; onclose: () => void } = $props();

	type Kind = 'fountain' | 'ballpoint' | 'highlighter';

	let kind: Kind = $derived(preset.tool === 'highlighter' ? 'highlighter' : preset.nib);
	let colors = $derived([...SWATCHES, ...tools.colors]);

	function setKind(next: Kind) {
		if (next === 'highlighter') tools.update({ tool: 'highlighter', width: Math.max(preset.width, 12) });
		else tools.update({ tool: 'pen', nib: next, width: preset.tool === 'highlighter' ? 2.2 : preset.width });
	}
</script>

<Popover {anchor} label={t('toolbar-pen-options')} role="dialog" minWidth={292} maxHeight={480} {onclose}>
	<div class="flex flex-col gap-4 p-3">
		<Segmented
			label={t('pen-kind')}
			value={kind}
			options={[
				{ value: 'fountain', label: t('pen-fountain') },
				{ value: 'ballpoint', label: t('pen-ballpoint') },
				{ value: 'highlighter', label: t('pen-highlighter') }
			]}
			onchange={setKind}
		/>
		<Slider
			label={t('pen-thickness')}
			value={preset.width}
			min={kind === 'highlighter' ? 6 : 0.6}
			max={kind === 'highlighter' ? 36 : 9}
			step={0.1}
			format={(value) => value.toFixed(1)}
			oninput={(width) => tools.update({ width })}
			onchange={(width) => tools.update({ width })}
		/>
		<div class="grid grid-cols-6 gap-1.5" role="radiogroup" aria-label={t('pen-color')}>
			{#each colors as color (color)}
				<button
					type="button"
					class="color"
					role="radio"
					aria-checked={preset.color === color}
					aria-label={colorName(color)}
					style:--swatch={css(color)}
					style:color={readableOn(color)}
					onclick={() => tools.update({ color })}
				>
					{#if preset.color === color}
						<Check size={16} strokeWidth={2.6} />
					{/if}
				</button>
			{/each}
		</div>
		<div class="flex justify-between gap-2">
			<button type="button" class="plain-button" disabled={tools.presets.length <= 1} onclick={() => (tools.removePreset(preset.id), onclose())}>
				{t('pen-remove')}
			</button>
			<button type="button" class="button" onclick={() => (tools.addPreset(), onclose())}>{t('pen-add')}</button>
		</div>
	</div>
</Popover>

<style>
	.color {
		display: grid;
		aspect-ratio: 1;
		place-items: center;
		border-radius: var(--radius-pill);
		background: var(--swatch);
		box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--ink) 12%, transparent);
		transition: transform var(--motion-tap);
	}

	.color:active {
		transform: scale(0.92);
	}

	.color[aria-checked='true'] {
		box-shadow:
			0 0 0 2px var(--popover),
			0 0 0 4px var(--accent-line);
	}
</style>
