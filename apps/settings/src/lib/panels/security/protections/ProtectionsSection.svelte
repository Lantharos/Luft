<script lang="ts">
	import CircuitBoard from '@lucide/svelte/icons/circuit-board';
	import Microchip from '@lucide/svelte/icons/microchip';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import { Row, Section } from '@luft/ui';
	import { app } from '#lib/state/app.svelte.js';
	import DrivesRow from '../encryption/DrivesRow.svelte';
	import EncryptionRow from '../encryption/EncryptionRow.svelte';
	import type { SecurityState } from '../state.svelte';
	import HardwareDialog from './HardwareDialog.svelte';
	import { levelSentence } from './hsi';
	import StartupRow from './StartupRow.svelte';
	import UsbRow from './UsbRow.svelte';

	let { security }: { security: SecurityState } = $props();

	let detailing = $state(false);

	let updates = $derived(security.firmwareUpdates);
</script>

<Section>
	{#if security.trust}
		{@const trust = security.trust}
		<EncryptionRow disk={trust.disk} tpm={trust.tpm} />
		{#if trust.drives.available}
			<DrivesRow drives={trust.drives} />
		{/if}
		{#if trust.secureBoot === 'on'}
			<Row title="Secure Boot" description="Only trusted software can start this computer" icon={ShieldCheck} />
		{/if}
		<StartupRow key={trust.signingKey} startup={trust.startup} />
		{#if trust.tpm.usable}
			<Row title="Security chip" description="Keeps keys safe and checks how this computer started" icon={Microchip} />
		{/if}
	{/if}
	{#if security.host}
		<Row title="Hardware security" description={levelSentence(security.host)} icon={CircuitBoard} onclick={() => (detailing = true)} />
	{/if}
	{#if updates}
		<Row
			title="Firmware updates are ready"
			description="{updates} {updates === 1 ? 'update' : 'updates'} for your hardware in Updates"
			icon={RefreshCw}
			onclick={() => app.open('updates')}
		/>
	{/if}
	{#if security.usb}
		<UsbRow {security} usb={security.usb} />
	{/if}
</Section>

{#if detailing && security.host}
	<HardwareDialog host={security.host} onclose={() => (detailing = false)} />
{/if}
