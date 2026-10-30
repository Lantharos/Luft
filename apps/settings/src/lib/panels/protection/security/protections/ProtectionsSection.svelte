<script lang="ts">
	import CircuitBoard from '@lucide/svelte/icons/circuit-board';
	import Microchip from '@lucide/svelte/icons/microchip';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import { t } from '@luft/i18n';
	import { Row, Section } from '@luft/ui';
	import { app } from '#lib/state/app.svelte.js';
	import AntiCheatRow from './AntiCheatRow.svelte';
	import type { SecurityState } from '../state.svelte';
	import HardwareDialog from './HardwareDialog.svelte';
	import { levelSentence } from './hsi';
	import StartupRow from './StartupRow.svelte';
	import UsbRow from './UsbRow.svelte';

	let { security }: { security: SecurityState } = $props();

	let detailing = $state(false);

	let updates = $derived(security.firmwareUpdates);
</script>

<Section title={t('settings-page-protections')}>
	{#if security.trust}
		{@const trust = security.trust}
		{#if trust.secureBoot === 'on'}
			<Row title={t('settings-security-secure-boot')} description={t('settings-security-secure-boot-description')} icon={ShieldCheck} />
		{/if}
		<StartupRow key={trust.signingKey} startup={trust.startup} />
		{#if trust.tpm.usable}
			<Row title={t('settings-security-chip')} description={t('settings-security-chip-description')} icon={Microchip} />
		{/if}
		<AntiCheatRow antiCheat={trust.antiCheat} key={trust.signingKey} />
	{/if}
	{#if security.host}
		<Row title={t('settings-security-hardware')} description={levelSentence(security.host)} icon={CircuitBoard} onclick={() => (detailing = true)} />
	{/if}
	{#if updates}
		<Row
			title={t('settings-firmware-updates-ready')}
			description={t('settings-firmware-updates-count', { count: updates })}
			icon={RefreshCw}
			onclick={() => app.open('system')}
		/>
	{/if}
	{#if security.usb}
		<UsbRow {security} usb={security.usb} />
	{/if}
</Section>

{#if detailing && security.host}
	<HardwareDialog host={security.host} onclose={() => (detailing = false)} />
{/if}
