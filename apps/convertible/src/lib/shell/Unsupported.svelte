<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog } from '@luft/ui';
	import { capabilities } from '#lib/state/capabilities.svelte.js';
	import { missingReason } from '#lib/state/formats.js';
	import { session } from '#lib/state/session.svelte.js';

	const notes = $derived([
		{ title: t('unsupported-office-title'), body: t('unsupported-office-body') },
		{ title: t('unsupported-pdf-word-title'), body: t('unsupported-pdf-word-body') },
		{ title: t('unsupported-locked-title'), body: t('unsupported-locked-body') },
		{ title: t('unsupported-alphabets-title'), body: t('unsupported-alphabets-body') },
		{ title: t('unsupported-rar-title'), body: t('unsupported-rar-body') },
		{ title: t('unsupported-subtitles-title'), body: t('unsupported-subtitles-body') },
		{ title: t('unsupported-drm-title'), body: t('unsupported-drm-body') },
		{ title: t('unsupported-fonts-title'), body: t('unsupported-fonts-body') }
	]);
	const missing = $derived(capabilities.current?.missing ?? []);
</script>

<Dialog title={t('unsupported-title')} description={t('unsupported-intro')} wide onclose={() => (session.showUnsupported = false)}>
	<dl class="flex max-h-[380px] flex-col gap-3 overflow-y-auto text-[13px]">
		{#each missing as id (id)}
			<div>
				<dt class="font-medium">{id.toUpperCase()}</dt>
				<dd class="text-[var(--text-soft)]">{missingReason(id)}</dd>
			</div>
		{/each}
		{#each notes as note (note.title)}
			<div>
				<dt class="font-medium">{note.title}</dt>
				<dd class="text-[var(--text-soft)]">{note.body}</dd>
			</div>
		{/each}
	</dl>
	{#snippet actions()}
		<button type="button" class="button primary" onclick={() => (session.showUnsupported = false)}>{t('action-close')}</button>
	{/snippet}
</Dialog>
