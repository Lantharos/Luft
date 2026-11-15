<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, Slider } from '@luft/ui';
	import { tasks, type Target } from './actions.svelte';

	interface Props {
		target: Target;
		nice: number;
	}

	const presets = $derived([
		{ value: -15, label: t('barometer-priority-highest') },
		{ value: -5, label: t('barometer-priority-high') },
		{ value: 0, label: t('barometer-priority-normal') },
		{ value: 5, label: t('barometer-priority-low') },
		{ value: 15, label: t('barometer-priority-lowest') }
	]);

	let { target, nice }: Props = $props();

	let value = $state(0);
	let saving = $state(false);

	$effect.pre(() => {
		value = nice;
	});

	async function apply() {
		saving = true;
		await tasks.setPriority(target, value);
		saving = false;
	}
</script>

<Dialog
	title={t('barometer-priority-title', { name: target.title })}
	description={t('barometer-priority-description')}
	onclose={() => (tasks.priority = null)}
>
	<div class="flex flex-col gap-4">
		<div class="presets" role="radiogroup" aria-label={t('barometer-priority-presets')}>
			{#each presets as preset (preset.value)}
				<button type="button" role="radio" aria-checked={value === preset.value} class:active={value === preset.value} onclick={() => (value = preset.value)}>
					{preset.label}
				</button>
			{/each}
		</div>
		<div class="flex items-center gap-4">
			<Slider label={t('barometer-priority-niceness')} min={-20} max={19} step={1} {value} oninput={(next) => (value = next)} onchange={(next) => (value = next)} />
			<span class="w-10 flex-none text-right tabular-nums">{value}</span>
		</div>
		<p class="text-[12px] text-[var(--text-muted)]">{t('barometer-priority-range')}</p>
	</div>
	{#snippet actions()}
		<button type="button" class="button" onclick={() => (tasks.priority = null)}>{t('barometer-cancel')}</button>
		<button type="button" class="button primary" disabled={saving || value === nice} onclick={apply}>{t('barometer-priority-change')}</button>
	{/snippet}
</Dialog>

<style>
	.presets {
		display: grid;
		grid-template-columns: repeat(5, minmax(0, 1fr));
		gap: 4px;
		padding: 3px;
		border-radius: var(--radius-pill);
		background: var(--control);
	}

	.presets button {
		min-height: 30px;
		border-radius: var(--radius-pill);
		font-size: 12.5px;
		font-weight: 500;
		color: var(--text-muted);
		transition:
			background-color var(--motion-tap) var(--ease-decelerate),
			color var(--motion-tap) var(--ease-decelerate);
	}

	.presets button:hover,
	.presets .active {
		color: var(--text);
	}

	.presets .active {
		background: var(--control-hover);
	}
</style>
