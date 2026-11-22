<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes, date, Row, Section } from '@luft/ui';
	import type { InstalledApp, Origin } from '#lib/bindings.js';
	import type { AppDetails } from '#lib/catalog/types.js';
	import { sourceName } from '#lib/format.js';
	import { openUrl } from '#lib/bridge/index.js';

	let { details, installed }: { details: AppDetails | null; installed: InstalledApp | null } = $props();

	const ORIGINS: Record<Origin, string> = { schelf: 'app-origin-store', flathub: 'app-origin-flathub', fedora: 'app-origin-fedora' };

	function license(value: string) {
		if (/proprietary/i.test(value)) return t('app-license-proprietary');
		return value.replace(/^LicenseRef-/, '');
	}

	const version = $derived(installed?.version ?? details?.release?.version ?? null);
	const size = $derived.by(() => {
		if (installed?.size) return t('app-size-on-disk', { size: bytes(installed.size) });
		const [download, onDisk] = [details?.downloadSize, details?.installedSize];
		if (download && onDisk) return t('app-size-download-and-disk', { download: bytes(download), installed: bytes(onDisk) });
		if (download) return t('app-size-download', { size: bytes(download) });
		if (onDisk) return t('app-size-on-disk', { size: bytes(onDisk) });
		return null;
	});
	const source = $derived.by(() => {
		if (installed) {
			const name = sourceName(installed);
			if (installed.source === 'flatpak') return t(installed.installation === 'user' ? 'app-source-for-you' : 'app-source-for-everyone', { source: name });
			if (installed.source === 'system') return t('app-origin-fedora');
			return name;
		}
		return t(ORIGINS[details?.origin ?? 'flathub']);
	});
</script>

<Section title={t('app-details')}>
	{#if version}
		<Row title={t('app-version')} description={details?.release?.date ? t('app-released', { date: date(details.release.date) }) : undefined}><span class="select-text">{version}</span></Row>
	{/if}
	{#if size}
		<Row title={t('app-size')}><span>{size}</span></Row>
	{/if}
	<Row title={t('app-source')} description={installed?.path ?? undefined}><span class="select-text">{source}</span></Row>
	{#if installed?.commands.length}
		<Row title={t('app-commands')} description={t('app-commands-description')}><span class="max-w-[320px] truncate select-text">{installed.commands.join(', ')}</span></Row>
	{/if}
	{#if installed?.services.length}
		<Row title={t('app-services')} description={t('app-services-description')}><span class="max-w-[320px] truncate select-text">{installed.services.join(', ')}</span></Row>
	{/if}
	{#if details?.developer}
		<Row title={t('app-developer')} description={details.verified ?? undefined}><span class="text-right">{details.developer}</span></Row>
	{/if}
	{#if details?.license}
		<Row title={t('app-license')}><span class="max-w-[320px] truncate">{license(details.license)}</span></Row>
	{/if}
	{#if details?.homepage}
		{@const homepage = details.homepage}
		<Row title={t('app-website')} description={new URL(homepage).host}>
			<button type="button" class="button" onclick={() => openUrl(homepage)}>{t('app-visit')}</button>
		</Row>
	{/if}
</Section>
