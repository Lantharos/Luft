<script lang="ts">
	import { LANGUAGES, t } from '@luft/i18n';
	import { Slider, Switch } from '@luft/ui';
	import { settings } from '#lib/app/settings.svelte.js';
	import HandwritingDialog from '#lib/convert/HandwritingDialog.svelte';
	import { languages } from '#lib/convert/read.js';
	import { reader } from '#lib/handwriting/reader.svelte.js';
	import LanguagesDialog from './LanguagesDialog.svelte';

	let dialog: 'download' | 'languages' | null = $state(null);

	let names = $derived(
		[...new Set(languages().map((tag) => tag.split('-')[0]))]
			.map((tag) => LANGUAGES.find((language) => language.tag === tag)?.name)
			.filter(Boolean)
			.join(', ')
	);

	function turn(on: boolean) {
		if (on && !reader.model?.installed) dialog = 'download';
		else settings.set('convert', on);
	}
</script>

{#if reader.model !== undefined}
	<section class="flex flex-col gap-4">
		<div class="flex items-center justify-between gap-4">
			<div class="min-w-0">
				<h3 class="text-[14px] font-semibold">{t('settings-convert')}</h3>
				<p class="text-[12.5px] text-(--text-soft)">{t('settings-convert-body')}</p>
			</div>
			<Switch label={t('settings-convert')} checked={settings.values.convert && !!reader.model?.installed} disabled={!reader.model} onchange={turn} />
		</div>
		{#if settings.values.convert && reader.model?.installed}
			<div class="flex flex-col gap-1">
				<Slider
					label={t('settings-convert-after')}
					value={settings.values.convertAfter / 1000}
					min={0.5}
					max={2}
					step={0.1}
					format={(value) => t('settings-convert-seconds', { value })}
					onchange={(value) => settings.set('convertAfter', Math.round(value * 1000))}
				/>
				<p class="text-[12px] text-(--text-muted)">{t('settings-convert-pause', { value: settings.values.convertAfter / 1000 })}</p>
			</div>
		{/if}
		<div class="flex items-center justify-between gap-4">
			<div class="min-w-0">
				<p class="text-[13.5px]">{t('settings-languages')}</p>
				<p class="truncate text-[12px] text-(--text-muted)">{names}</p>
			</div>
			<button type="button" class="button flex-none" onclick={() => (dialog = 'languages')}>{t('settings-languages-choose')}</button>
		</div>
		<div class="flex items-center justify-between gap-4">
			<div class="min-w-0">
				<p class="text-[13.5px]">{t('settings-keep-corrections')}</p>
				<p class="text-[12px] text-(--text-muted)">{t('settings-keep-corrections-body')}</p>
			</div>
			<Switch label={t('settings-keep-corrections')} checked={settings.values.keepCorrections} onchange={(value) => settings.set('keepCorrections', value)} />
		</div>
	</section>
{/if}

{#if dialog === 'download'}
	<HandwritingDialog
		onclose={() => {
			if (reader.model?.installed) settings.set('convert', true);
			dialog = null;
		}}
	/>
{:else if dialog === 'languages'}
	<LanguagesDialog onclose={() => (dialog = null)} />
{/if}
