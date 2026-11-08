<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes, Dialog, errorText, formatClock } from '@luft/ui';
	import type { OpenNotebook } from '#lib/library/notebook.svelte.js';
	import type { Processing, RecordingEntry } from '../model';
	import { power } from '../power.svelte';
	import { processing } from '../processing.svelte';

	let { notebook, recording, onclose }: { notebook: OpenNotebook; recording: RecordingEntry; onclose: () => void } = $props();

	let failure = $state('');
	let missing = $derived([processing.whisper, processing.writer].filter((model) => model && !model.installed));
	let size = $derived(missing.reduce((total, model) => total + (model?.size ?? 0), 0));

	async function choose(when: Processing) {
		try {
			if (missing.length) await processing.download();
			processing.choose(notebook, recording, when);
			onclose();
		} catch (error) {
			failure = errorText(error);
		}
	}
</script>

<Dialog title={t('stopped-title', { length: formatClock((recording.length ?? 0) / 1000) })} {onclose}>
	<div class="flex flex-col gap-3 text-[13.5px] leading-relaxed text-(--text-soft)">
		<p>{t('stopped-body')}</p>
		{#if missing.length}
			<p>{t('stopped-download', { size: bytes(size) })}</p>
		{/if}
		{#if power.battery}
			<p>{power.onBattery ? t('stopped-on-battery') : t('stopped-charging')}</p>
		{/if}
		{#if failure}
			<p class="text-(--danger)">{failure}</p>
		{/if}
	</div>
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>{t('stopped-keep')}</button>
		{#if power.battery}
			<button type="button" class="button" class:primary={power.onBattery} onclick={() => void choose('charger')}>{t('stopped-charger')}</button>
		{/if}
		<button type="button" class="button" class:primary={!power.battery || !power.onBattery} onclick={() => void choose('now')}>{t('stopped-now')}</button>
	{/snippet}
</Dialog>
