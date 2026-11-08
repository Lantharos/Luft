<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes, errorText, ProgressBar } from '@luft/ui';
	import { reader } from '#lib/handwriting/reader.svelte.js';

	let failure = $state('');

	let download = $derived(reader.model?.download ?? null);
	let fraction = $derived(download && download.total ? download.received / download.total : 0);

	async function run(action: () => Promise<void>) {
		failure = '';
		try {
			await action();
		} catch (error) {
			failure = errorText(error);
		}
	}

	let status = $derived(
		reader.waiting === 'battery'
			? t('settings-handwriting-battery')
			: reader.waiting === 'charger'
				? t('settings-handwriting-charger')
			: reader.left
				? `${t('settings-handwriting-reading', { pages: reader.left })}. ${reader.waiting === 'writing' ? t('settings-handwriting-waiting') : ''}`
				: t('settings-handwriting-done')
	);
</script>

{#if reader.model !== undefined}
	<section class="flex flex-col gap-2">
		<div class="flex items-start justify-between gap-4">
			<div class="min-w-0">
				<h3 class="text-[14px] font-semibold">{t('settings-handwriting')}</h3>
				<p class="text-[12.5px] text-(--text-soft)">{t('settings-handwriting-body')}</p>
			</div>
			{#if reader.model && (reader.model.installed || download)}
				<button type="button" class="button flex-none" onclick={() => void run(() => reader.remove())}>{t('settings-handwriting-remove')}</button>
			{:else if reader.model}
				<button type="button" class="button primary flex-none" onclick={() => void run(() => reader.download())}>
					{t('settings-handwriting-download', { size: bytes(reader.model.size) })}
				</button>
			{/if}
		</div>
		{#if !reader.model}
			<p class="text-[12px] text-(--text-muted)">{t('settings-handwriting-missing')}</p>
		{:else if download && !reader.model.installed}
			<ProgressBar {fraction} label={t('settings-handwriting-downloading', { percent: Math.round(fraction * 100) })} />
			<p class="text-[12px] text-(--text-muted) tabular-nums">{t('settings-handwriting-downloading', { percent: Math.round(fraction * 100) })}</p>
		{:else if reader.on}
			<p class="text-[12px] text-(--text-muted)">{status}</p>
		{/if}
		{#if download?.problem || failure}
			<p class="text-[12px] text-(--danger)">{t('settings-handwriting-failed', { error: download?.problem ?? failure })}</p>
		{/if}
	</section>
{/if}
