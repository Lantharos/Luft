<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes, tooltip } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { ImageDetails, Item } from '#lib/bindings.js';
	import { openUri } from '#lib/bridge/index.js';
	import { formatDate, formatExposure, formatLocation, formatNumber } from '#lib/library/format.js';
	import { extension } from '#lib/library/kinds.js';

	let { item }: { item: Item } = $props();

	let details = $state.raw<ImageDetails | null>(null);

	$effect(() => {
		const path = item.path;
		commands.imageDetails({ path }).then((found) => item.path === path && (details = found));
	});

	let rows = $derived.by(() => {
		const rows: [string, string][] = [];
		const add = (label: string, value: string | null | undefined) => value && rows.push([label, value]);
		if (details?.width && details.height) {
			const megapixels = (details.width * details.height) / 1e6;
			add(
				t('magpie-details-dimensions'),
				t('magpie-details-dimensions-value', {
					width: String(details.width),
					height: String(details.height),
					megapixels: formatNumber(megapixels, megapixels < 10 ? 1 : 0, true)
				})
			);
		}
		add(t('magpie-details-size'), bytes(item.size));
		add(t('magpie-details-type'), extension(item.name).toUpperCase());
		add(t('magpie-details-taken'), details?.taken ? formatDate(details.taken) : null);
		add(t('magpie-details-modified'), formatDate(item.modified));
		add(t('magpie-details-camera'), details?.camera);
		add(t('magpie-details-lens'), details?.lens);
		const exposure = [
			details?.aperture && t('magpie-details-aperture', { aperture: formatNumber(details.aperture, 1) }),
			details?.exposure && formatExposure(details.exposure),
			details?.iso && t('magpie-details-iso', { iso: String(details.iso) })
		].filter(Boolean);
		add(t('magpie-details-exposure'), exposure.join('  ·  '));
		add(t('magpie-details-focal-length'), details?.focalLength ? t('magpie-details-millimetres', { length: formatNumber(details.focalLength, 1) }) : null);
		return rows;
	});

	function showOnMap() {
		const location = details?.location;
		if (!location) return;
		const { latitude, longitude } = location;
		void openUri(`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`);
	}
</script>

<aside class="details" aria-label={t('magpie-photo-details')}>
	<h2 class="mb-4 truncate text-[15px] font-semibold" {@attach tooltip(item.name)}>{item.name}</h2>
	<dl class="flex flex-col gap-3.5">
		{#each rows as [label, value] (label)}
			<div>
				<dt class="text-[12px] text-[var(--text-muted)]">{label}</dt>
				<dd class="text-[13px] break-words text-[var(--text)]">{value}</dd>
			</div>
		{/each}
		{#if details?.location}
			<div>
				<dt class="text-[12px] text-[var(--text-muted)]">{t('magpie-details-location')}</dt>
				<dd class="text-[13px] text-[var(--text)]">
					{formatLocation(details.location)}
				</dd>
				<button type="button" class="plain-button -ml-3 mt-1" onclick={showOnMap}>{t('magpie-details-map')}</button>
			</div>
		{/if}
	</dl>
</aside>

<style>
	.details {
		width: 280px;
		flex: none;
		overflow-y: auto;
		background: var(--content);
		padding: 20px 22px;
	}
</style>
