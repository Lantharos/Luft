<script lang="ts">
	import CircuitBoard from '@lucide/svelte/icons/circuit-board';
	import Microchip from '@lucide/svelte/icons/microchip';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import { Row, Section } from '@luft/ui';
	import { app } from '$lib/state/app.svelte';
	import type { HostSecurity, SecureBoot, Trust } from '../api';
	import HardwareDialog from './HardwareDialog.svelte';
	import { levelSentence, levelWord, nextStep } from './hsi';

	interface Props {
		trust: Trust | null;
		host: HostSecurity | null;
		firmwareUpdates: number | null;
	}

	const SECURE_BOOT: Record<SecureBoot, { state: string; description: string }> = {
		on: { state: 'On', description: 'Only trusted software can start your computer' },
		off: { state: 'Off', description: 'Turn it on in your computer’s firmware settings so only trusted software can start it' },
		setup: { state: 'Setup mode', description: 'Your firmware has no platform key yet, so anything can start the computer' },
		unsupported: { state: 'Not available', description: 'This computer doesn’t start in a way that supports Secure Boot' }
	};

	let { trust, host, firmwareUpdates }: Props = $props();

	let detailing = $state(false);

	let secureBoot = $derived(trust ? (SECURE_BOOT[trust.secureBoot] ?? SECURE_BOOT.unsupported) : null);

	const tpmDescription = $derived.by(() => {
		if (!trust) return '';
		if (trust.tpm.usable) return 'A security chip that keeps your disk’s key safe and checks how the computer started';
		if (trust.tpm.reason) return trust.tpm.reason;
		return trust.tpm.present ? 'The security chip can’t be used right now' : 'This computer doesn’t have a security chip';
	});

	const firmwareDescription = $derived.by(() => {
		if (firmwareUpdates === null) return 'Looking for updates…';
		if (!firmwareUpdates) return 'The software built into your hardware is up to date';
		return `${firmwareUpdates} ${firmwareUpdates === 1 ? 'update is' : 'updates are'} ready in Updates`;
	});
</script>

<Section title="Device security">
	{#if trust && secureBoot}
		<Row title="Secure Boot" icon={ShieldCheck} description={secureBoot.description}>
			<span>{secureBoot.state}</span>
		</Row>
		<Row title="TPM" icon={Microchip} description={tpmDescription}>
			{#if trust.tpm.present}
				<span>{trust.tpm.version ? `Version ${trust.tpm.version}` : 'Present'}</span>
			{/if}
		</Row>
	{:else}
		<Row title="Device security details aren’t available" description="Secure Boot, the TPM and device encryption can’t be checked on this computer" />
	{/if}
	{#if host}
		<Row
			title="Hardware security"
			icon={CircuitBoard}
			description={[levelSentence(host), nextStep(host)].filter(Boolean).join('. ')}
			onclick={() => (detailing = true)}
		>
			<span>{levelWord(host)}</span>
		</Row>
	{/if}
	<Row title="Firmware" icon={RefreshCw} description={firmwareDescription} onclick={() => app.open('updates')}>
		{#if firmwareUpdates}
			<span>{firmwareUpdates}</span>
		{/if}
	</Row>
</Section>

{#if detailing && host}
	<HardwareDialog {host} onclose={() => (detailing = false)} />
{/if}
