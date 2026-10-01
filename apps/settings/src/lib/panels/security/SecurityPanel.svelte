<script lang="ts">
	import { onDestroy } from 'svelte';
	import ShieldAlert from '@lucide/svelte/icons/shield-alert';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import { firmware } from '$lib/panels/updates/api';
	import EncryptionSection from './encryption/EncryptionSection.svelte';
	import UnlockDialog from './encryption/UnlockDialog.svelte';
	import { unlockPrompt } from './encryption/unlock.svelte';
	import KeyringSection from './KeyringSection.svelte';
	import OverviewSection from './overview/OverviewSection.svelte';
	import PasskeysSection from './PasskeysSection.svelte';
	import StartupSection from './startup/StartupSection.svelte';
	import { SecurityState } from './state.svelte';
	import { summarize } from './summary';
	import UsbSection from './UsbSection.svelte';

	const security = new SecurityState();

	let firmwareUpdates = $state<number | null>(null);

	let summary = $derived(security.trust ? summarize(security.trust, firmwareUpdates) : null);

	void security.start();
	firmware()
		.then((devices) => (firmwareUpdates = devices.length))
		.catch(() => (firmwareUpdates = 0));
	onDestroy(() => security.stop());
</script>

{#if summary}
	{@const Icon = summary.safe ? ShieldCheck : ShieldAlert}
	<div class="flex items-center gap-4 px-2 pb-1">
		<span class="plate" class:safe={summary.safe}><Icon size={26} strokeWidth={1.75} /></span>
		<div class="flex min-w-0 flex-1 flex-col gap-1">
			<span class="text-[26px] font-semibold">{summary.headline}</span>
			<span class="text-[14px] text-[var(--text-muted)]">{summary.sentence}</span>
		</div>
	</div>
{/if}

{#if security.loaded}
	<OverviewSection trust={security.trust} host={security.host} {firmwareUpdates} />

	{#if security.trust}
		<EncryptionSection trust={security.trust} />
		<StartupSection trust={security.trust} />
	{/if}

	{#if security.usb}
		<UsbSection {security} usb={security.usb} />
	{/if}

	<KeyringSection />
	<PasskeysSection />
{/if}

{#if unlockPrompt.request}
	<UnlockDialog rejected={unlockPrompt.request.rejected} />
{/if}

<style>
	.plate {
		display: grid;
		height: 56px;
		width: 56px;
		flex: none;
		place-items: center;
		border-radius: var(--radius-pill);
		background: var(--surface);
		color: var(--text-soft);
	}

	.plate.safe {
		color: var(--success);
	}
</style>
