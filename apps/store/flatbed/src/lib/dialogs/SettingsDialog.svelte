<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, MultiChoice, Row, Switch } from '@luft/ui';
	import { byPriority, languageName } from '#lib/app/languages.js';
	import { flatbed } from '#lib/app/flatbed.svelte.js';

	let { onclose }: { onclose: () => void } = $props();

	let languages = $derived((flatbed.readingLanguages ?? []).map((code) => ({ value: code, label: languageName(code) })).sort(byPriority));
</script>

<Dialog title={t('settings-title')} wide {onclose}>
	<div class="flex flex-col gap-5">
		<div class="row-group">
			<Row title={t('settings-fine')} description={t('settings-fine-detail')}>
				<Switch label={t('settings-fine')} checked={flatbed.settings.fine} onchange={(fine) => void flatbed.saveSettings({ ...flatbed.settings, fine })} />
			</Row>
		</div>
		<section class="flex flex-col gap-2">
			<h2 class="px-1 text-[13px] font-semibold">{t('settings-languages')}</h2>
			{#if languages.length}
				<p class="px-1 text-[13px] leading-[1.45] text-[var(--text-soft)]">{t('settings-languages-detail')}</p>
				<MultiChoice
					label={t('settings-languages')}
					options={languages}
					value={flatbed.settings.languages}
					onchange={(chosen) => void flatbed.saveSettings({ ...flatbed.settings, languages: languages.map((option) => option.value).filter((code) => chosen.includes(code)) })}
				/>
			{:else}
				<p class="px-1 text-[13px] leading-[1.45] text-[var(--text-soft)]">{t('settings-languages-missing')}</p>
			{/if}
		</section>
	</div>
	{#snippet actions()}
		<button type="button" class="button primary" onclick={onclose}>{t('dialog-done')}</button>
	{/snippet}
</Dialog>
