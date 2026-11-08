<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes, Dialog, errorText, ProgressBar } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import { reader } from '#lib/handwriting/reader.svelte.js';

	let { onclose }: { onclose: () => void } = $props();

	let failure = $state('');
	let download = $derived(reader.model?.download ?? null);
	let fraction = $derived(download && download.total ? download.received / download.total : 0);

	$effect(() => {
		if (reader.model?.installed) onclose();
	});

	async function start() {
		failure = '';
		try {
			await commands.handwritingInstall();
		} catch (error) {
			failure = errorText(error);
		}
	}
</script>

<Dialog title={t('convert-download-title')} description={reader.model ? t('convert-download-body') : t('settings-handwriting-missing')} {onclose}>
	{#if download}
		<ProgressBar {fraction} label={t('settings-handwriting-downloading', { percent: Math.round(fraction * 100) })} />
		<p class="text-[12px] text-(--text-muted) tabular-nums">{t('settings-handwriting-downloading', { percent: Math.round(fraction * 100) })}</p>
	{/if}
	{#if download?.problem || failure}
		<p class="text-[12px] text-(--danger)">{t('settings-handwriting-failed', { error: download?.problem ?? failure })}</p>
	{/if}
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>{t('dialog-cancel')}</button>
		{#if reader.model && !download}
			<button type="button" class="button primary" onclick={() => void start()}>{t('settings-handwriting-download', { size: bytes(reader.model.size) })}</button>
		{/if}
	{/snippet}
</Dialog>
