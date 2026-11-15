<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes } from '@luft/ui';
	import type { NetworkInfo, NetworkSample } from '#lib/bindings.js';
	import { count, decimal, networkRate } from '#lib/format.js';
	import Chart from '#lib/resources/common/Chart.svelte';
	import Facts from '#lib/resources/common/Facts.svelte';
	import Page from '#lib/resources/common/Page.svelte';
	import Stats from '#lib/resources/common/Stats.svelte';
	import { byId, networkKinds } from '#lib/resources/registry.js';
	import { monitor } from '#lib/state/monitor.svelte.js';
	import { settings } from '#lib/state/settings.svelte.js';

	interface Props {
		info: NetworkInfo;
	}

	const FLOOR = 64 * 1024;

	let { info }: Props = $props();

	let network = $derived(monitor.latest ? byId(monitor.latest.networks, info.id) : undefined);
	let link = $derived(network?.link);
	let label = $derived({
		download: t('barometer-network-download'),
		upload: t('barometer-network-upload'),
		downloading: t('barometer-network-downloading'),
		uploading: t('barometer-network-uploading'),
		downloaded: t('barometer-network-downloaded'),
		uploaded: t('barometer-network-uploaded'),
		sinceStartup: t('barometer-since-startup'),
		signal: t('barometer-network-signal'),
		status: t('barometer-network-status'),
		connected: t('barometer-network-connected'),
		disconnected: t('barometer-network-disconnected'),
		speed: t('barometer-network-link-speed'),
		addresses: t('barometer-network-addresses'),
		mac: t('barometer-network-mac'),
		adapter: t('barometer-network-adapter'),
		manufacturer: t('barometer-manufacturer'),
		driver: t('barometer-driver'),
		interface: t('barometer-network-interface'),
		mtu: t('barometer-network-mtu')
	});

	function series(pick: (sample: NetworkSample) => number) {
		return monitor.ticks.map((tick) => {
			const sample = byId(tick.networks, info.id);
			return sample ? pick(sample) : null;
		});
	}

	function linkSpeed(megabits: number) {
		return megabits >= 1000 ? `${decimal(megabits / 1000)} Gbit/s` : `${count(megabits)} Mbit/s`;
	}
</script>

<Page title={networkKinds()[info.kind]} detail={info.name}>
	<Chart
		title={t('barometer-network-traffic')}
		tall
		floor={FLOOR}
		binary={!settings.value.networkBits}
		lines={[
			{ values: series((sample) => sample.received) },
			{ values: series((sample) => sample.sent), tone: 'soft', fill: false }
		]}
		legend={[
			{ label: label.download, value: networkRate(network?.received ?? 0) },
			{ label: label.upload, value: networkRate(network?.sent ?? 0), tone: 'soft' }
		]}
		scale={(max) => networkRate(max)}
	/>

	<Stats
		stats={[
			{ label: label.downloading, value: networkRate(network?.received ?? 0) },
			{ label: label.uploading, value: networkRate(network?.sent ?? 0) },
			{ label: label.downloaded, value: bytes(network?.receivedTotal ?? 0), detail: label.sinceStartup },
			{ label: label.uploaded, value: bytes(network?.sentTotal ?? 0), detail: label.sinceStartup },
			...(link?.signal != null ? [{ label: label.signal, value: `${count(link.signal)} dBm` }] : [])
		]}
	/>

	<Facts
		title={t('barometer-details')}
		facts={[
			{ label: label.status, value: link ? (link.connected ? label.connected : label.disconnected) : null },
			{ label: label.speed, value: link?.speed ? linkSpeed(link.speed) : null },
			{ label: label.addresses, value: link?.addresses, mono: true },
			{ label: label.mac, value: info.mac, mono: true },
			{ label: label.adapter, value: info.model },
			{ label: label.manufacturer, value: info.vendor },
			{ label: label.driver, value: info.driver },
			{ label: label.interface, value: info.name, mono: true },
			{ label: label.mtu, value: link?.mtu ? String(link.mtu) : null }
		]}
	/>
</Page>
