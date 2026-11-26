<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, Switch } from '@luft/ui';
	import { untrack } from 'svelte';

	interface Props {
		width: number;
		height: number;
		onresize: (width: number, height: number) => void;
		onclose: () => void;
	}

	let { width: startWidth, height: startHeight, onresize, onclose }: Props = $props();
	const MAX = 16384;

	let width = $state(untrack(() => startWidth));
	let height = $state(untrack(() => startHeight));
	let linked = $state(true);
	let valid = $derived(width >= 1 && height >= 1 && width <= MAX && height <= MAX && (width !== startWidth || height !== startHeight));

	function setWidth(value: number) {
		width = value;
		if (linked) height = Math.max(1, Math.round((value * startHeight) / startWidth));
	}

	function setHeight(value: number) {
		height = value;
		if (linked) width = Math.max(1, Math.round((value * startWidth) / startHeight));
	}
</script>

<Dialog title={t('easel-resize')} {onclose}>
	<div class="flex flex-col gap-4">
		<div class="flex items-center gap-2">
			<label class="flex flex-1 flex-col gap-1.5 text-[12.5px] text-(--text-muted)">
				{t('easel-width')}
				<input class="text-field tabular-nums" inputmode="numeric" value={width} oninput={(event) => setWidth(Number(event.currentTarget.value) || 0)} />
			</label>
			<span class="pt-5 text-(--text-muted)">×</span>
			<label class="flex flex-1 flex-col gap-1.5 text-[12.5px] text-(--text-muted)">
				{t('easel-height')}
				<input class="text-field tabular-nums" inputmode="numeric" value={height} oninput={(event) => setHeight(Number(event.currentTarget.value) || 0)} />
			</label>
		</div>
		<div class="flex items-center justify-between text-[13px]">
			<span>{t('easel-keep-proportions')}</span>
			<Switch label={t('easel-keep-proportions')} checked={linked} onchange={(checked) => (linked = checked)} />
		</div>
	</div>
	{#snippet actions()}
		<button type="button" class="plain-button" onclick={onclose}>{t('easel-cancel')}</button>
		<button
			type="button"
			class="button primary"
			disabled={!valid}
			onclick={() => {
				onresize(width, height);
				onclose();
			}}>{t('easel-resize-apply')}</button
		>
	{/snippet}
</Dialog>
