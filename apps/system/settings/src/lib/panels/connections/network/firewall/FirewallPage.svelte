<script lang="ts">
	import EthernetPort from '@lucide/svelte/icons/ethernet-port';
	import WifiIcon from '@lucide/svelte/icons/wifi';
	import X from '@lucide/svelte/icons/x';
	import { i18n, t } from '@luft/i18n';
	import { errorText, IconButton, Row, Section, Segmented, Spinner } from '@luft/ui';
	import SubPage from '#lib/components/SubPage.svelte';
	import {
		waitForPerson,
		type Firewall,
		type FirewallAccess,
		type FirewallApp,
		type GuardedNetwork,
		type NetworkType,
		type OpenPort
	} from '@luft/network';
	import { commands } from '#lib/bindings.js';
	import { extensions } from '#lib/panels/personalization/extensions/extensions.svelte.js';
	import type { NetworkState } from '../state.svelte';
	import AppsSection from './AppsSection.svelte';
	import HowDialog from './HowDialog.svelte';
	import OpenPortRow from './OpenPortRow.svelte';
	import { portDescription } from './ports';

	interface Props {
		connections: NetworkState;
		firewall: Firewall;
		onclose: () => void;
	}

	let { connections, firewall, onclose }: Props = $props();

	let listening = $derived((extensions.list ?? []).filter((extension) => extension.enabled && extension.listen.length));

	void extensions.load();

	let closing = $state<string | null>(null);
	let explaining = $state(false);
	let problem = $state('');

	let types = $derived<{ value: NetworkType; label: string }[]>([
		{ value: 'home', label: t('settings-network-firewall-home') },
		{ value: 'public', label: t('settings-network-firewall-public') }
	]);

	const portKey = (port: OpenPort) => `${port.port}/${port.protocol}`;
	const portList = (ports: number[]) => new Intl.ListFormat(i18n.formats, { type: 'conjunction' }).format(ports.map(String));

	function describe(network: GuardedNetwork) {
		if (!network.networkType) return t('settings-network-firewall-unchosen');
		return network.connected ? t('settings-network-firewall-connected') : undefined;
	}

	async function attempt(action: () => Promise<unknown>) {
		problem = '';
		try {
			await action();
			await connections.refreshFirewall();
			return true;
		} catch (reason) {
			problem = errorText(reason);
			return false;
		}
	}

	function classify(network: GuardedNetwork, networkType: NetworkType) {
		void attempt(() => commands.networkSetType({ connection: network.connection, networkType }));
	}

	function allow(app: FirewallApp, access: FirewallAccess) {
		void attempt(() => commands.networkSetAppAccess({ kind: app.kind, id: app.id, access }, waitForPerson));
	}

	function forget(app: FirewallApp) {
		void attempt(() => commands.networkForgetApp({ kind: app.kind, id: app.id }, waitForPerson));
	}

	async function closePort(port: OpenPort) {
		closing = portKey(port);
		await attempt(() => commands.networkClosePort(port, waitForPerson));
		closing = null;
	}
</script>

<SubPage title={t('settings-page-firewall')} {onclose}>
	{#if problem}
		<p class="-my-3 px-2 text-[13px] text-[var(--danger)]">{problem}</p>
	{/if}

	<p class="-mb-2 flex items-baseline justify-between gap-3 px-2 text-[13px] text-[var(--text-soft)]">
		{t('settings-network-firewall.description')}
		<button type="button" class="shrink-0 font-medium text-[var(--accent)] hover:underline" onclick={() => (explaining = true)}>{t('settings-network-firewall-how')}</button>
	</p>

	<Section>
		{#each firewall.networks as network (network.connection)}
			<Row title={network.name} icon={network.medium === 'wifi' ? WifiIcon : EthernetPort} description={describe(network)}>
				<Segmented label={network.name} options={types} value={network.networkType ?? 'public'} onchange={(networkType) => classify(network, networkType)} />
			</Row>
		{:else}
			<Row title={t('settings-network-firewall-no-networks')} />
		{/each}
	</Section>

	<AppsSection apps={firewall.apps} onchange={allow} onforget={forget} />

	{#if listening.length}
		<Section title={t('settings-network-firewall-extensions')}>
			{#each listening as extension (extension.id)}
				<Row title={extension.name} description={t('settings-network-firewall-extension-ports', { count: extension.listen.length, ports: portList(extension.listen) })} />
			{/each}
		</Section>
	{/if}

	<Section title={t('settings-network-firewall-services')}>
		{#each firewall.openPorts as port (portKey(port))}
			<Row title={t('settings-network-firewall-port', { port: port.port })} description={portDescription(port)}>
				{#if closing === portKey(port)}
					<Spinner />
				{:else}
					<IconButton icon={X} label={t('settings-network-firewall-close-port')} disabled={closing !== null} onclick={() => closePort(port)} />
				{/if}
			</Row>
		{/each}
		<OpenPortRow onopen={(port) => attempt(() => commands.networkOpenPort(port, waitForPerson))} />
	</Section>
</SubPage>

{#if explaining}
	<HowDialog onclose={() => (explaining = false)} />
{/if}
