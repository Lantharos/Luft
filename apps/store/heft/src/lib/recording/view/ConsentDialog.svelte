<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog } from '@luft/ui';

	let { onrecord, onclose }: { onrecord: () => void; onclose: () => void } = $props();
</script>

<Dialog title={t('consent-title')} {onclose}>
	<div class="flex flex-col gap-3 text-[13.5px] leading-relaxed text-(--text-soft)">
		<p>{t('consent-ask')}</p>
		<p>{t('consent-law')}</p>
		<p>{t('consent-local')}</p>
	</div>
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>{t('dialog-cancel')}</button>
		<button type="button" class="button primary" onclick={onrecord}>{t('consent-record')}</button>
	{/snippet}
</Dialog>
