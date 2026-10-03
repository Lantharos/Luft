<script lang="ts">
	import type { ImageDetails, Item } from '#lib/api.js';
	import * as api from '#lib/api.js';
	import { formatBytes, formatCoordinate, formatDate, formatExposure } from '#lib/library/format.js';
	import { extension } from '#lib/library/kinds.js';

	let { item }: { item: Item } = $props();

	let details = $state.raw<ImageDetails | null>(null);

	$effect(() => {
		const path = item.path;
		api.imageDetails(path).then((found) => item.path === path && (details = found));
	});

	let rows = $derived.by(() => {
		const rows: [string, string][] = [];
		const add = (label: string, value: string | null | undefined) => value && rows.push([label, value]);
		if (details?.width && details.height) {
			const megapixels = (details.width * details.height) / 1e6;
			add('Dimensions', `${details.width} × ${details.height} (${megapixels.toFixed(megapixels < 10 ? 1 : 0)} MP)`);
		}
		add('Size', formatBytes(item.size));
		add('Type', extension(item.name).toUpperCase());
		add('Taken', details?.taken ? formatDate(details.taken) : null);
		add('Modified', formatDate(item.modified));
		add('Camera', details?.camera);
		add('Lens', details?.lens);
		const exposure = [
			details?.aperture && `ƒ/${details.aperture.toLocaleString(undefined, { maximumFractionDigits: 1 })}`,
			details?.exposure && formatExposure(details.exposure),
			details?.iso && `ISO ${details.iso}`
		].filter(Boolean);
		add('Exposure', exposure.join('  ·  '));
		add('Focal length', details?.focalLength ? `${details.focalLength.toLocaleString(undefined, { maximumFractionDigits: 1 })} mm` : null);
		return rows;
	});

	function showOnMap() {
		const location = details?.location;
		if (!location) return;
		const { latitude, longitude } = location;
		void api.openUri(`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`);
	}
</script>

<aside class="details soft-scroll" aria-label="Details">
	<h2 class="mb-4 truncate text-[15px] font-semibold" title={item.name}>{item.name}</h2>
	<dl class="flex flex-col gap-3.5">
		{#each rows as [label, value] (label)}
			<div>
				<dt class="text-[12px] text-[var(--text-muted)]">{label}</dt>
				<dd class="text-[13px] break-words text-[var(--text)]">{value}</dd>
			</div>
		{/each}
		{#if details?.location}
			<div>
				<dt class="text-[12px] text-[var(--text-muted)]">Location</dt>
				<dd class="text-[13px] text-[var(--text)]">
					{formatCoordinate(details.location.latitude, 'N', 'S')}, {formatCoordinate(details.location.longitude, 'E', 'W')}
				</dd>
				<button type="button" class="plain-button -ml-3 mt-1" onclick={showOnMap}>Show on map</button>
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
