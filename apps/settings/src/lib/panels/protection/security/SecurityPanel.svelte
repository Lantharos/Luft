<script lang="ts">
	import { onDestroy } from 'svelte';
	import ShieldAlert from '@lucide/svelte/icons/shield-alert';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import UnlockDialog from './encryption/UnlockDialog.svelte';
	import UnlockSection from './encryption/UnlockSection.svelte';
	import { unlockPrompt } from './encryption/unlock.svelte';
	import AccessPage from './keyring/access/AccessPage.svelte';
	import { KeyringState } from './keyring/state.svelte';
	import KeyringSection from './KeyringSection.svelte';
	import PasskeysSection from './PasskeysSection.svelte';
	import ProtectionsSection from './protections/ProtectionsSection.svelte';
	import { SecurityState } from './state.svelte';
	import { summarize } from './summary';

	const security = new SecurityState();
	const keyring = new KeyringState();

	let browsingAccess = $state(false);

	let summary = $derived(security.trust && summarize(security.trust, security.firmwareUpdates));
	let disk = $derived(security.trust?.disk);
	let access = $derived(keyring.current && !keyring.current.locked ? keyring.current.access : null);
	let protections = $derived(Boolean(security.trust || security.host || security.firmwareUpdates || security.usb));

	$effect(() => {
		if (!access) browsingAccess = false;
	});

	void security.start();
	void keyring.load();
	onDestroy(() => {
		security.stop();
		keyring.stop();
	});
</script>

{#if browsingAccess && access}
	<AccessPage {access} refresh={keyring.load} onclose={() => (browsingAccess = false)} />
{:else}
	{#if summary}
		{@const Icon = summary.safe ? ShieldCheck : ShieldAlert}
		<div class="flex items-center gap-4 px-2 pb-1">
			<span class="plate" class:safe={summary.safe}><Icon size={26} strokeWidth={1.75} /></span>
			<div class="flex min-w-0 flex-1 flex-col gap-1">
				<span class="truncate text-[26px] font-semibold">{summary.headline}</span>
				<span class="truncate text-[14px] text-[var(--text-muted)]">{summary.sentence}</span>
			</div>
		</div>
	{/if}

	{#if security.loaded}
		{#if protections}
			<ProtectionsSection {security} />
		{/if}

		{#if security.trust && disk?.encrypted && disk.state !== 'decrypting'}
			<UnlockSection trust={security.trust} />
		{/if}

		<KeyringSection {keyring} fingerprintReader={security.fingerprintReader} onaccess={() => (browsingAccess = true)} />
		<PasskeysSection fingerprintReader={security.fingerprintReader} />
	{/if}
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
