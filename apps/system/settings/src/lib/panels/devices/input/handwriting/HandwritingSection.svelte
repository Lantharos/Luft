<script lang="ts">
	import { t } from '@luft/i18n';
	import { onDestroy } from 'svelte';
	import { bytes, ProgressBar, Row, Section, Switch } from '@luft/ui';
	import { commands, events } from '#lib/bindings.js';
	import type { HandwritingModel } from '#lib/bindings.js';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import { openHomepage } from '../dictation/api';

	const settings = useSettings<{ enabled: boolean }>('com.lantharos.kestrel.handwriting', ['enabled']);

	let model = $state<HandwritingModel | null>(null);
	let unavailable = $state(false);

	let enabled = $derived(settings.values.enabled ?? false);
	let download = $derived(model?.download);
	let downloading = $derived(!!download && !download.problem);

	function describe() {
		if (unavailable) return t('settings-handwriting-not-installed');
		if (download?.problem) return t('settings-handwriting-failed', { reason: download.problem });
		if (download) return t('settings-handwriting-downloading', { received: bytes(download.received), total: bytes(download.total) });
		if (enabled && model?.installed) return t('settings-handwriting-on');
		return t('settings-handwriting-off', { size: bytes(model?.size ?? 0) });
	}

	async function refresh() {
		try {
			model = await commands.handwriting();
			unavailable = false;
		} catch {
			unavailable = true;
		}
	}

	const stop = events.handwritingChanged((next) => (model = next));
	onDestroy(stop);

	$effect(() => {
		void settings.values.enabled;
		void refresh();
	});
</script>

{#snippet progress()}
	<ProgressBar fraction={download?.total ? download.received / download.total : null} />
{/snippet}

<Section title={t('settings-handwriting-title')}>
	<Row title={t('settings-handwriting-title')} description={describe()} disabled={unavailable} below={downloading ? progress : undefined}>
		<Switch label={t('settings-handwriting-title')} checked={enabled} disabled={unavailable} onchange={(on) => settings.set('enabled', on)} />
	</Row>
	{#if model}
		{@const current = model}
		<Row title={current.name} description={t('settings-dictation-credit', { credit: current.credit, licence: current.licence })}>
			{#if current.installed && !enabled}
				<button type="button" class="button" onclick={() => commands.handwritingRemove()}>{t('settings-dictation-model-remove')}</button>
			{/if}
			<button type="button" class="button" onclick={() => openHomepage(current.homepage)}>{t('settings-dictation-learn-more')}</button>
		</Row>
	{/if}
</Section>
