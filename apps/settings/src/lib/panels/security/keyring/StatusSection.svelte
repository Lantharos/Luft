<script lang="ts">
	import { Row, Section, Switch } from '@luft/ui';
	import { app } from '#lib/state/app.svelte.js';
	import { lock, reseal, setLockWithScreen, setPin, unlock, type Keyring } from './api';
	import { askedApps, contents, protection, sealed } from './describe';
	import { Runner } from './runner.svelte';

	interface Props {
		keyring: Keyring;
		fingerprintReader: boolean;
		refresh: () => Promise<void>;
		onaccess: () => void;
	}

	let { keyring, fingerprintReader, refresh, onaccess }: Props = $props();

	const runner = new Runner(() => refresh());

	let chipSealed = $derived(sealed(keyring));
	let resealable = $derived(keyring.chip === 'ready' && !keyring.tpmSealed);
	let fingerprints = $derived(fingerprintReader && chipSealed);
	let access = $derived(keyring.access);
</script>

<Section title="Passwords and keys">
	<Row title={keyring.locked ? 'Locked' : contents(keyring.itemCount)} description={protection(keyring)}>
		{#if keyring.locked}
			<button type="button" class="button" disabled={runner.busy} onclick={() => runner.run(unlock)}>Unlock</button>
		{:else}
			<button type="button" class="button" disabled={runner.busy} onclick={() => runner.run(lock)}>Lock</button>
		{/if}
	</Row>
	{#if resealable}
		<Row title="Seal with the security chip" description="Copies of them can’t be opened on another computer">
			<button type="button" class="button" disabled={runner.busy || keyring.locked} onclick={() => runner.run(reseal)}>Seal</button>
		</Row>
	{/if}
	{#if fingerprints && keyring.fingerprintUnlock}
		<Row title="Unlocks with your fingerprint" description="Signing in with it unlocks your passwords too" />
	{:else if fingerprints}
		<Row title="Unlock with your fingerprint" description="Add a fingerprint in Users first" onclick={() => app.open('users')} />
	{/if}
	{#if fingerprints && (keyring.fingerprintUnlock || keyring.pin)}
		<Row title="Ask for a PIN after the fingerprint" description={keyring.locked ? 'Unlock your keyring to change this' : 'So a fingerprint alone can’t unlock them'}>
			<Switch
				label="Ask for a PIN after the fingerprint"
				checked={keyring.pin}
				disabled={keyring.locked || runner.busy}
				onchange={(enabled) => runner.run(() => setPin(enabled))}
			/>
		</Row>
	{/if}
	<Row title="Lock with the screen" description="They lock and unlock along with the screen">
		<Switch
			label="Lock with the screen"
			checked={keyring.lockWithScreen}
			disabled={keyring.locked || runner.busy}
			onchange={(enabled) => runner.run(() => setLockWithScreen(enabled))}
		/>
	</Row>
	{#if access && (access.apps.length || access.stores.length || access.history.length)}
		<Row
			title="Apps with access"
			description={keyring.locked ? 'Unlock your keyring to see them' : askedApps(access.apps.length)}
			disabled={keyring.locked}
			onclick={onaccess}
		/>
	{/if}
</Section>

{#if runner.error}
	<p class="-mt-4 px-2 text-[13px] text-[var(--danger)]">{runner.error}</p>
{/if}
