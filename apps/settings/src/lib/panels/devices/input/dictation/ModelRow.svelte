<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes, ProgressBar, Row } from '@luft/ui';
	import { cancelInstall, install, remove, type Model } from './api';

	let { model, removable = false }: { model: Model; removable?: boolean } = $props();

	let download = $derived(model.download);
	let downloading = $derived(!!download && !download.problem);

	function describe() {
		if (download?.problem) return t('settings-dictation-model-failed', { reason: download.problem });
		if (download) return t('settings-dictation-model-downloading', { received: bytes(download.received), total: bytes(download.total) });
		if (model.installed) return t('settings-dictation-model-installed', { size: bytes(model.usage) });
		if (model.usage > 0) return t('settings-dictation-model-partial', { received: bytes(model.usage), total: bytes(model.size) });
		return t('settings-dictation-model-size', { size: bytes(model.size) });
	}
</script>

{#snippet progress()}
	<ProgressBar fraction={download?.total ? download.received / download.total : null} />
{/snippet}

<Row title={model.name} description={describe()} below={downloading ? progress : undefined}>
	{#if download}
		{#if download.problem}
			<button type="button" class="button" onclick={() => install(model.id)}>{t('settings-dictation-model-retry')}</button>
		{/if}
		<button type="button" class="button" onclick={() => cancelInstall(model.id)}>{t('settings-dictation-model-cancel')}</button>
	{:else}
		{#if !model.installed}
			<button type="button" class="button" onclick={() => install(model.id)}>{model.usage > 0 ? t('settings-dictation-model-resume') : t('settings-dictation-model-download')}</button>
		{/if}
		{#if removable}
			<button type="button" class="button" onclick={() => remove(model.id)}>{t('settings-dictation-model-remove')}</button>
		{/if}
	{/if}
</Row>
