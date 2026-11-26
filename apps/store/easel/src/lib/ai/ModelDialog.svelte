<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes, Dialog, ProgressBar } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import { models } from './models.svelte';

	let engine = $derived(models.asking!.engine);
	let model = $derived(models.find(engine));
	let downloading = $derived(model?.received !== null && model?.received !== undefined);
</script>

{#if model}
	<Dialog title={t('easel-model-title', { name: model.name })} description={t('easel-model-body', { size: bytes(model.size), licence: model.licence })} onclose={() => models.decline()}>
		<div class="flex flex-col gap-3 px-1 pb-1">
			<p class="text-[12.5px] text-(--text-muted)">{model.credit}</p>
			{#if downloading}
				<ProgressBar fraction={(model.received ?? 0) / model.size} label={t('easel-model-downloading')} />
			{/if}
			{#if model.problem}
				<p class="text-[13px] text-(--danger)">{model.problem}</p>
			{/if}
		</div>
		{#snippet actions()}
			<button type="button" class="plain-button" onclick={() => models.decline()}>{t('easel-cancel')}</button>
			<button type="button" class="button primary" disabled={downloading && !model.problem} onclick={() => void commands.aiInstall({ engine })}>{t('easel-model-download')}</button>
		{/snippet}
	</Dialog>
{/if}
