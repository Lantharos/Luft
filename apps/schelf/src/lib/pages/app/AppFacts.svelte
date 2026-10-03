<script lang="ts">
	import { Row, Section } from '@luft/ui';
	import type { InstalledApp } from '#lib/bridge/types.js';
	import type { AppDetails } from '#lib/catalog/types.js';
	import { bytes, date, sourceName } from '#lib/format.js';
	import { backend } from '#lib/state/backend.js';

	let { details, installed }: { details: AppDetails | null; installed: InstalledApp | null } = $props();

	function license(value: string) {
		if (/proprietary/i.test(value)) return 'Proprietary';
		return value.replace(/^LicenseRef-/, '');
	}

	const version = $derived(installed?.version ?? details?.release?.version ?? null);
	const size = $derived.by(() => {
		if (installed?.size) return `${bytes(installed.size)} on disk`;
		const parts = [details?.downloadSize ? `${bytes(details.downloadSize)} to download` : null, details?.installedSize ? `${bytes(details.installedSize)} on disk` : null];
		return parts.filter(Boolean).join(', ') || null;
	});
	const source = $derived.by(() => {
		if (installed) {
			const name = sourceName(installed.source, installed.origin);
			if (installed.source === 'flatpak') return `${name}, ${installed.installation === 'user' ? 'for you only' : 'for everyone on this computer'}`;
			return name;
		}
		return details?.origin === 'flathub' ? 'Flathub' : 'Fedora';
	});
</script>

<Section title="Details">
	{#if version}
		<Row title="Version" description={details?.release?.date ? `Released ${date(details.release.date)}` : undefined}><span>{version}</span></Row>
	{/if}
	{#if size}
		<Row title="Size"><span>{size}</span></Row>
	{/if}
	<Row title="Source" description={installed?.path ?? undefined}><span>{source}</span></Row>
	{#if details?.developer}
		<Row title="Developer" description={details.verified ? `Verified as ${details.verified}` : undefined}><span class="text-right">{details.developer}</span></Row>
	{/if}
	{#if details?.license}
		<Row title="License"><span class="max-w-[320px] truncate">{license(details.license)}</span></Row>
	{/if}
	{#if details?.homepage}
		{@const homepage = details.homepage}
		<Row title="Website" description={new URL(homepage).host}>
			<button type="button" class="button" onclick={() => backend().openUrl(homepage)}>Visit</button>
		</Row>
	{/if}
</Section>
