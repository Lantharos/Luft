<script lang="ts">
	import { t } from '@luft/i18n';
	import { Segmented, Slider, Switch } from '@luft/ui';
	import type { Paper, PaperColor, PaperSize, Template } from '#lib/library/model.js';
	import PaperBackground from './PaperBackground.svelte';
	import { DEFAULT_SPACING } from './templates';

	let { paper = $bindable() }: { paper: Paper } = $props();

	const TEMPLATES: Template[] = ['blank', 'lined', 'grid', 'dotted', 'cornell', 'staff'];
	const NAMES: Record<Template, string> = {
		blank: t('paper-blank'),
		lined: t('paper-lined'),
		grid: t('paper-grid'),
		dotted: t('paper-dotted'),
		cornell: t('paper-cornell'),
		staff: t('paper-staff')
	};

	const PREVIEW = { width: 210 * 3.78, height: 297 * 3.78 };

	function pick(template: Template) {
		paper = { ...paper, template, spacing: DEFAULT_SPACING[template] };
	}
</script>

<div class="flex flex-col gap-4">
	<div class="grid grid-cols-6 gap-2" role="radiogroup" aria-label={t('paper-template')}>
		{#each TEMPLATES as template (template)}
			<button type="button" class="template" role="radio" aria-checked={paper.template === template} onclick={() => pick(template)}>
				<span class="preview relative block overflow-hidden">
					<PaperBackground paper={{ ...paper, template, spacing: DEFAULT_SPACING[template] }} width={PREVIEW.width} height={PREVIEW.height} id="preview-{template}" />
				</span>
				<span class="text-[12px]">{NAMES[template]}</span>
			</button>
		{/each}
	</div>
	<Segmented
		label={t('paper-size')}
		value={paper.size}
		options={[
			{ value: 'a4' as PaperSize, label: 'A4' },
			{ value: 'a5' as PaperSize, label: 'A5' },
			{ value: 'letter' as PaperSize, label: t('paper-letter') },
			{ value: 'infinite' as PaperSize, label: t('paper-infinite') }
		]}
		onchange={(size) => (paper = { ...paper, size })}
	/>
	<Segmented
		label={t('paper-color')}
		value={paper.color}
		options={[
			{ value: 'white' as PaperColor, label: t('paper-white') },
			{ value: 'cream' as PaperColor, label: t('paper-cream') },
			{ value: 'dark' as PaperColor, label: t('paper-dark') }
		]}
		onchange={(color) => (paper = { ...paper, color })}
	/>
	{#if paper.template !== 'blank'}
		<Slider
			label={t('paper-spacing')}
			value={paper.spacing}
			min={paper.template === 'staff' ? 1.5 : 4}
			max={paper.template === 'staff' ? 3 : 12}
			step={0.5}
			format={(value) => t('paper-millimetres', { value })}
			onchange={(spacing) => (paper = { ...paper, spacing })}
		/>
	{/if}
	{#if paper.size !== 'infinite'}
		<div class="flex items-center justify-between gap-4">
			<span class="text-[13px]">{t('paper-landscape')}</span>
			<Switch label={t('paper-landscape')} checked={paper.landscape} onchange={(landscape) => (paper = { ...paper, landscape })} />
		</div>
	{/if}
</div>

<style>
	.template {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		border-radius: 12px;
		padding: 8px 6px;
		color: var(--text-soft);
		transition: background-color var(--motion-tap);
	}

	.template:hover {
		background: var(--surface-hover);
	}

	.template[aria-checked='true'] {
		background: var(--control);
		color: var(--text);
	}

	.preview {
		width: 100%;
		aspect-ratio: 210 / 297;
		border-radius: 4px;
		box-shadow: 0 0 0 1px var(--hairline);
	}
</style>
