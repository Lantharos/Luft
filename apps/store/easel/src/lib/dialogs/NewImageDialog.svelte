<script lang="ts">
	import { presetLabel } from '#lib/app/labels.js';
	import { t } from '@luft/i18n';
	import { Dialog, Segmented } from '@luft/ui';

	interface Props {
		oncreate: (width: number, height: number, background: string | null) => void;
		onclose: () => void;
	}

	let { oncreate, onclose }: Props = $props();

	const PRESETS = [
		{ value: 'hd', width: 1920, height: 1080 },
		{ value: 'square', width: 2048, height: 2048 },
		{ value: 'a4', width: 2480, height: 3508 },
		{ value: 'uhd', width: 3840, height: 2160 }
	];
	const MAX = 16384;

	let width = $state(1920);
	let height = $state(1080);
	let background = $state<'white' | 'black' | 'clear'>('white');
	let valid = $derived(width >= 1 && height >= 1 && width <= MAX && height <= MAX);

	function preset(value: string) {
		const chosen = PRESETS.find((entry) => entry.value === value)!;
		width = chosen.width;
		height = chosen.height;
	}
</script>

<Dialog title={t('easel-new-image')} {onclose}>
	<div class="flex flex-col gap-4">
		<div class="flex flex-wrap gap-1.5">
			{#each PRESETS as entry (entry.value)}
				<button type="button" class={['chip', width === entry.width && height === entry.height && 'is-on']} onclick={() => preset(entry.value)}>{presetLabel[entry.value]()}</button>
			{/each}
		</div>
		<div class="flex items-center gap-2">
			<label class="flex flex-1 flex-col gap-1.5 text-[12.5px] text-(--text-muted)">
				{t('easel-width')}
				<input class="text-field tabular-nums" type="text" inputmode="numeric" value={width} oninput={(event) => (width = Number(event.currentTarget.value) || 0)} />
			</label>
			<span class="pt-5 text-(--text-muted)">×</span>
			<label class="flex flex-1 flex-col gap-1.5 text-[12.5px] text-(--text-muted)">
				{t('easel-height')}
				<input class="text-field tabular-nums" type="text" inputmode="numeric" value={height} oninput={(event) => (height = Number(event.currentTarget.value) || 0)} />
			</label>
		</div>
		<Segmented
			label={t('easel-background')}
			value={background}
			options={[
				{ value: 'white', label: t('easel-background-white') },
				{ value: 'black', label: t('easel-background-black') },
				{ value: 'clear', label: t('easel-background-clear') }
			]}
			onchange={(value) => (background = value)}
		/>
	</div>
	{#snippet actions()}
		<button type="button" class="plain-button" onclick={onclose}>{t('easel-cancel')}</button>
		<button
			type="button"
			class="button primary"
			disabled={!valid}
			onclick={() => {
				oncreate(Math.round(width), Math.round(height), background === 'clear' ? null : background === 'white' ? '#ffffff' : '#000000');
				onclose();
			}}>{t('easel-create')}</button
		>
	{/snippet}
</Dialog>
