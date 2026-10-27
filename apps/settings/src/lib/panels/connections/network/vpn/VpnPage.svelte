<script lang="ts">
	import FileUp from '@lucide/svelte/icons/file-up';
	import KeyRound from '@lucide/svelte/icons/key-round';
	import Settings from '@lucide/svelte/icons/settings';
	import Shield from '@lucide/svelte/icons/shield';
	import { t } from '@luft/i18n';
	import { errorText, IconButton, Row, Section, Switch } from '@luft/ui';
	import SubPage from '#lib/components/SubPage.svelte';
	import { waitForPerson, type Vpn } from '@luft/network';
	import { commands } from '#lib/bindings.js';
	import type { Target } from '../connection/profile';
	import type { NetworkState } from '../state.svelte';
	import WireGuardDialog from './WireGuardDialog.svelte';

	interface Props {
		connections: NetworkState;
		vpns: Vpn[];
		onconfigure: (target: Target, title: string) => void;
		onclose: () => void;
	}

	let { connections, vpns, onconfigure, onclose }: Props = $props();

	let importing = $state(false);
	let importProblem = $state('');
	let creating = $state(false);

	async function importFile() {
		importing = true;
		importProblem = '';
		try {
			await commands.networkVpnImport(waitForPerson);
		} catch (reason) {
			importProblem = errorText(reason);
		} finally {
			importing = false;
		}
	}
</script>

{#snippet importNote()}
	<p class="pl-[34px] text-[12.5px] text-[var(--danger)]">{importProblem}</p>
{/snippet}

<SubPage title={t('settings-page-vpn')} back={t('settings-page-network')} {onclose}>
	<Section>
		{#each vpns as vpn (vpn.connection)}
			<Row title={vpn.name} icon={Shield} description={connections.vpnSummary(vpn)}>
				<IconButton
					icon={Settings}
					label={t('settings-network-connection-settings')}
					onclick={() => onconfigure({ kind: 'vpn', path: vpn.connection }, vpn.name)}
				/>
				<Switch label={vpn.name} checked={vpn.state !== 'disconnected'} onchange={(on) => connections.toggleVpn(vpn, on)} />
			</Row>
		{/each}
		<Row
			title={t('settings-network-vpn-import')}
			icon={FileUp}
			description={importing ? t('settings-network-vpn-importing') : t('settings-network-vpn-import.description')}
			disabled={importing}
			onclick={importFile}
			below={importProblem ? importNote : undefined}
		/>
		<Row
			title={t('settings-network-wireguard')}
			icon={KeyRound}
			description={t('settings-network-wireguard.description')}
			onclick={() => (creating = true)}
		/>
	</Section>
</SubPage>

{#if creating}
	<WireGuardDialog onclose={() => (creating = false)} />
{/if}
