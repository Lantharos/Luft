<script lang="ts">
	import FileUp from '@lucide/svelte/icons/file-up';
	import KeyRound from '@lucide/svelte/icons/key-round';
	import Settings from '@lucide/svelte/icons/settings';
	import Shield from '@lucide/svelte/icons/shield';
	import { IconButton, Row, Section, Switch } from '@luft/ui';
	import { importVpn, type Vpn } from '../api';
	import type { Target } from '../connection/profile';
	import { linkLabel } from '../describe';
	import WireGuardDialog from './WireGuardDialog.svelte';

	interface Props {
		vpns: Vpn[];
		problems: Record<string, string>;
		ontoggle: (vpn: Vpn, on: boolean) => void;
		onconfigure: (target: Target, title: string) => void;
	}

	let { vpns, problems, ontoggle, onconfigure }: Props = $props();

	let importing = $state(false);
	let importProblem = $state('');
	let creating = $state(false);

	function summary(vpn: Vpn) {
		return problems[vpn.connection] ?? (vpn.state === 'disconnected' ? undefined : linkLabel(vpn.state));
	}

	async function importFile() {
		importing = true;
		importProblem = '';
		try {
			await importVpn();
		} catch (reason) {
			importProblem = reason instanceof Error ? reason.message : String(reason);
		} finally {
			importing = false;
		}
	}
</script>

{#snippet importNote()}
	<p class="pl-[34px] text-[12.5px] text-[var(--danger)]">{importProblem}</p>
{/snippet}

<Section title="VPN">
	{#each vpns as vpn (vpn.connection)}
		<Row title={vpn.name} icon={Shield} description={summary(vpn)}>
			<IconButton
				icon={Settings}
				label="Connection settings"
				onclick={() => onconfigure({ kind: 'vpn', path: vpn.connection }, vpn.name)}
			/>
			<Switch label={vpn.name} checked={vpn.state !== 'disconnected'} onchange={(on) => ontoggle(vpn, on)} />
		</Row>
	{/each}
	<Row
		title="Import from a file"
		icon={FileUp}
		description={importing ? 'Importing…' : 'WireGuard, OpenVPN and other VPN configuration files'}
		disabled={importing}
		onclick={importFile}
		below={importProblem ? importNote : undefined}
	/>
	<Row title="Set up WireGuard" icon={KeyRound} description="Enter the details from your VPN provider or server" onclick={() => (creating = true)} />
</Section>

{#if creating}
	<WireGuardDialog onclose={() => (creating = false)} />
{/if}
