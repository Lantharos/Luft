<script lang="ts">
	import type { NetworkInfo, NetworkSample } from '$lib/backend/types';
	import { bytes, networkRate } from '$lib/format';
	import Chart from '$lib/resources/common/Chart.svelte';
	import Facts from '$lib/resources/common/Facts.svelte';
	import Page from '$lib/resources/common/Page.svelte';
	import Stats from '$lib/resources/common/Stats.svelte';
	import { byId, NETWORK_KINDS } from '$lib/resources/registry';
	import { monitor } from '$lib/state/monitor.svelte';
	import { settings } from '$lib/state/settings.svelte';

	interface Props {
		info: NetworkInfo;
	}

	const FLOOR = 64 * 1024;

	let { info }: Props = $props();

	let network = $derived(monitor.latest ? byId(monitor.latest.networks, info.id) : undefined);
	let link = $derived(network?.link);

	function series(pick: (sample: NetworkSample) => number) {
		return monitor.ticks.map((tick) => {
			const sample = byId(tick.networks, info.id);
			return sample ? pick(sample) : null;
		});
	}

	function linkSpeed(megabits: number) {
		return megabits >= 1000 ? `${megabits / 1000} Gbit/s` : `${megabits} Mbit/s`;
	}
</script>

<Page title={NETWORK_KINDS[info.kind]} detail={info.name}>
	<Chart
		title="Traffic"
		tall
		floor={FLOOR}
		binary={!settings.value.networkBits}
		lines={[
			{ values: series((sample) => sample.received) },
			{ values: series((sample) => sample.sent), tone: 'soft', fill: false }
		]}
		legend={[
			{ label: 'Download', value: networkRate(network?.received ?? 0) },
			{ label: 'Upload', value: networkRate(network?.sent ?? 0), tone: 'soft' }
		]}
		scale={(max) => networkRate(max)}
	/>

	<Stats
		stats={[
			{ label: 'Downloading', value: networkRate(network?.received ?? 0) },
			{ label: 'Uploading', value: networkRate(network?.sent ?? 0) },
			{ label: 'Downloaded', value: bytes(network?.receivedTotal ?? 0), detail: 'Since startup' },
			{ label: 'Uploaded', value: bytes(network?.sentTotal ?? 0), detail: 'Since startup' },
			...(link?.signal != null ? [{ label: 'Signal', value: `${link.signal} dBm` }] : [])
		]}
	/>

	<Facts
		title="Details"
		facts={[
			{ label: 'Status', value: link ? (link.connected ? 'Connected' : 'Disconnected') : null },
			{ label: 'Link speed', value: link?.speed ? linkSpeed(link.speed) : null },
			{ label: 'Addresses', value: link?.addresses, mono: true },
			{ label: 'Hardware address', value: info.mac, mono: true },
			{ label: 'Adapter', value: info.model },
			{ label: 'Manufacturer', value: info.vendor },
			{ label: 'Driver', value: info.driver },
			{ label: 'Interface', value: info.name, mono: true },
			{ label: 'MTU', value: link?.mtu ? String(link.mtu) : null }
		]}
	/>
</Page>
