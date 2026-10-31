<script lang="ts">
	import { onMount } from 'svelte';
	import { app } from '#lib/state/app.svelte.js';
	import ConnectionPage from './connection/ConnectionPage.svelte';
	import type { Target } from './connection/profile';
	import EthernetPage from './ethernet/EthernetPage.svelte';
	import Overview from './Overview.svelte';
	import { useProxy } from './proxy/proxy.svelte';
	import ProxyPage from './proxy/ProxyPage.svelte';
	import { NetworkState } from './state.svelte';
	import VpnPage from './vpn/VpnPage.svelte';
	import KnownNetworks from './wifi/KnownNetworks.svelte';
	import WifiPage from './wifi/WifiPage.svelte';

	interface Editing {
		target: Target;
		title: string;
	}

	const connections = new NetworkState();
	const proxy = useProxy();

	let editing = $state<Editing | null>(null);
	let browsingKnown = $state(false);

	let network = $derived(connections.network);
	let section = $derived(app.section);

	const close = () => (app.section = null);
	const configure = (target: Target, title: string) => (editing = { target, title });

	onMount(() => connections.start());
</script>

{#if network && editing}
	<ConnectionPage target={editing.target} title={editing.title} {network} onclose={() => (editing = null)} />
{:else if network && browsingKnown}
	<KnownNetworks {network} onconfigure={configure} onclose={() => (browsingKnown = false)} />
{:else if network?.wifi && section === 'wifi'}
	<WifiPage {connections} wifi={network.wifi} onbrowse={() => (browsingKnown = true)} onconfigure={configure} onclose={close} />
{:else if network?.wired.length && section === 'ethernet'}
	<EthernetPage {connections} wired={network.wired} onconfigure={configure} onclose={close} />
{:else if network && section === 'vpn'}
	<VpnPage {connections} vpns={network.vpns} onconfigure={configure} onclose={close} />
{:else if proxy.available && section === 'proxy'}
	<ProxyPage {proxy} onclose={close} />
{:else if network}
	<Overview {connections} {network} {proxy} onopen={(page) => (app.section = page)} />
{/if}
