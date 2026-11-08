<script lang="ts">
	import { i18n, t } from '@luft/i18n';
	import { bytes, errorText, ProgressBar, Segmented } from '@luft/ui';
	import { settings } from '#lib/app/settings.svelte.js';
	import { commands } from '#lib/bindings.js';
	import { spokenIn } from '#lib/recording/languages.js';
	import LanguagesDialog from './LanguagesDialog.svelte';
	import type { Processing } from '#lib/recording/model.js';
	import { power } from '#lib/recording/power.svelte.js';
	import { processing } from '#lib/recording/processing.svelte.js';

	let failure = $state('');
	let choosing = $state(false);
	const names = new Intl.DisplayNames([i18n.locale], { type: 'language' });

	const whens = (): { value: Processing; label: string }[] => [
		{ value: 'now', label: t('settings-process-now') },
		{ value: 'charger', label: t('settings-process-charger') }
	];

	let models = $derived(
		[
			{ model: processing.whisper, use: t('settings-recording-whisper'), remove: null },
			{ model: processing.writer, use: t('settings-recording-writer'), remove: () => commands.notesRemove() }
		].filter((entry) => entry.model)
	);

	async function run(action: () => Promise<unknown>) {
		failure = '';
		try {
			await action();
		} catch (error) {
			failure = errorText(error);
		}
	}
</script>

<section class="flex flex-col gap-2">
	<h3 class="text-[14px] font-semibold">{t('settings-recording')}</h3>
	<p class="text-[12.5px] text-(--text-soft)">{t('settings-recording-body')}</p>
	<h3 class="mt-2 text-[13.5px]">{t('settings-process')}</h3>
	<Segmented label={t('settings-process')} value={power.defaultProcessing} options={whens()} onchange={(value) => settings.set('backgroundWork', value)} />
	<p class="text-[12px] text-(--text-muted)">{t('settings-process-body')}</p>
	<div class="mt-2 flex items-center justify-between gap-4">
		<div class="min-w-0">
			<p class="text-[13.5px]">{t('settings-languages')}</p>
			<p class="truncate text-[12px] text-(--text-muted)">{spokenIn().map((code) => names.of(code) ?? code).join(', ')}</p>
		</div>
		<button type="button" class="button flex-none" onclick={() => (choosing = true)}>{t('settings-languages-choose')}</button>
	</div>
	{#each models as { model, use, remove } (use)}
		{@const download = model!.download}
		{@const fraction = download && download.total ? download.received / download.total : 0}
		<div class="mt-2 flex items-start justify-between gap-4">
			<div class="min-w-0">
				<p class="text-[13.5px]">{model!.name}</p>
				<p class="text-[12px] text-(--text-muted)">{t('settings-recording-model', { use, size: bytes(model!.size), licence: model!.licence })}</p>
			</div>
			{#if model!.installed && remove}
				<button type="button" class="button flex-none" onclick={() => void run(remove)}>{t('settings-handwriting-remove')}</button>
			{:else if !model!.installed && !download}
				<button type="button" class="button flex-none" onclick={() => void run(() => processing.download())}>{t('settings-handwriting-download', { size: bytes(model!.size) })}</button>
			{/if}
		</div>
		{#if download && !model!.installed}
			<ProgressBar {fraction} label={t('settings-handwriting-downloading', { percent: Math.round(fraction * 100) })} />
		{/if}
		{#if download?.problem}
			<p class="text-[12px] text-(--danger)">{t('settings-handwriting-failed', { error: download.problem })}</p>
		{/if}
	{/each}
	{#if failure}
		<p class="text-[12px] text-(--danger)">{failure}</p>
	{/if}
</section>

{#if choosing}
	<LanguagesDialog onclose={() => (choosing = false)} />
{/if}
