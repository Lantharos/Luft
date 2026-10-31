<script lang="ts">
	import History from '@lucide/svelte/icons/history';
	import WifiIcon from '@lucide/svelte/icons/wifi';
	import { t } from '@luft/i18n';
	import { Row, Section, Switch } from '@luft/ui';
	import SubPage from '#lib/components/SubPage.svelte';
	import type { Wifi } from '@luft/network';
	import { commands } from '#lib/bindings.js';
	import type { Target } from '../connection/profile';
	import type { NetworkState } from '../state.svelte';
	import WifiSection from './WifiSection.svelte';

	interface Props {
		connections: NetworkState;
		wifi: Wifi;
		onbrowse: () => void;
		onconfigure: (target: Target, title: string) => void;
		onclose: () => void;
	}

	let { connections, wifi, onbrowse, onconfigure, onclose }: Props = $props();

	let known = $derived(connections.network?.known.length ?? 0);
</script>

<SubPage title={t('settings-page-wifi')} {onclose}>
	<Section>
		<Row title={t('settings-network-wifi')} icon={WifiIcon} description={connections.wifiSummary(wifi)} truncate>
			<Switch label={t('settings-network-wifi')} checked={wifi.enabled} disabled={!wifi.hardwareEnabled} onchange={(enabled) => commands.networkSetWifi({ enabled })} />
		</Row>
		{#if known}
			<Row title={t('settings-network-known')} icon={History} description={t('settings-network-known-count', { count: known })} onclick={onbrowse} />
		{/if}
	</Section>

	{#if wifi.enabled}
		<WifiSection {wifi} {onconfigure} />
	{/if}
</SubPage>
