<script lang="ts">
	import { LANGUAGES, t } from '@luft/i18n';
	import { Dialog, MultiChoice } from '@luft/ui';
	import { settings } from '#lib/app/settings.svelte.js';
	import { languages } from '#lib/convert/read.js';

	let { onclose }: { onclose: () => void } = $props();

	const options = LANGUAGES.map((language) => ({ value: language.tag.split('-')[0], label: language.name })).filter((option, index, all) => all.findIndex((other) => other.value === option.value) === index);

	let chosen = $state([...new Set(languages().map((tag) => tag.split('-')[0]))].filter((tag) => options.some((option) => option.value === tag)));
</script>

<Dialog title={t('settings-languages')} description={t('settings-languages-body')} wide {onclose}>
	<div class="max-h-[50vh] overflow-y-auto soft-scroll">
		<MultiChoice label={t('settings-languages')} {options} value={chosen} least={1} onchange={(value) => (chosen = value)} />
	</div>
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>{t('dialog-cancel')}</button>
		<button type="button" class="button primary" onclick={() => (settings.set('languages', $state.snapshot(chosen)), onclose())}>{t('dialog-save')}</button>
	{/snippet}
</Dialog>
