<script lang="ts">
	import Archive from '@lucide/svelte/icons/archive';
	import Fingerprint from '@lucide/svelte/icons/fingerprint';
	import KeyRound from '@lucide/svelte/icons/key-round';
	import Lock from '@lucide/svelte/icons/lock';
	import LockOpen from '@lucide/svelte/icons/lock-open';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import { Row, Section, Switch } from '@luft/ui';
	import { app } from '$lib/state/app.svelte';
	import { importKeyring, lock, reseal, setLockWithScreen, setPin, unlock, type Keyring } from './api';
	import { chipProblem, contents, fingerprintUnlock, protection, sealed } from './describe';
	import { Runner } from './runner.svelte';

	let { keyring, refresh }: { keyring: Keyring; refresh: () => Promise<void> } = $props();

	const runner = new Runner(() => refresh());

	let chipSealed = $derived(sealed(keyring));
	let resealable = $derived(keyring.chip === 'ready' && !keyring.tpmSealed);
	let fingerprint = $derived(fingerprintUnlock(keyring));
	let addFingerprint = $derived(chipSealed && !keyring.fingerprintUnlock);
	let chipNote = $derived(resealable ? 'This computer’s security chip can protect it too' : chipProblem(keyring.chip) || undefined);
	let pinNote = $derived(chipSealed && keyring.locked ? 'Unlock your keyring to change this' : 'Your fingerprint alone won’t unlock your passwords');
</script>

<Section title="Passwords and keys">
	<Row title={protection(keyring)} description={chipNote} icon={chipSealed ? ShieldCheck : KeyRound}>
		{#if resealable}
			<button type="button" class="button" disabled={runner.busy || keyring.locked} onclick={() => runner.run(reseal)}>Protect with security chip</button>
		{/if}
	</Row>
	<Row
		title={keyring.locked ? 'Locked' : 'Unlocked'}
		description={keyring.locked ? 'Unlock to use and manage your saved passwords' : contents(keyring.itemCount)}
		icon={keyring.locked ? Lock : LockOpen}
	>
		{#if keyring.locked}
			<button type="button" class="button" disabled={runner.busy} onclick={() => runner.run(unlock)}>Unlock</button>
		{:else}
			<button type="button" class="button" disabled={runner.busy} onclick={() => runner.run(lock)}>Lock now</button>
		{/if}
	</Row>
	<Row title={fingerprint.title} description={fingerprint.description} icon={Fingerprint} onclick={addFingerprint ? () => app.open('users') : undefined} />
	<Row title="Ask for a PIN after the fingerprint" description={pinNote} disabled={!chipSealed}>
		<Switch
			label="Ask for a PIN after the fingerprint"
			checked={keyring.pin}
			disabled={!chipSealed || keyring.locked || runner.busy}
			onchange={(enabled) => runner.run(() => setPin(enabled))}
		/>
	</Row>
	<Row title="Lock with the screen" description="Your passwords lock whenever the screen does and unlock with it again">
		<Switch
			label="Lock with the screen"
			checked={keyring.lockWithScreen}
			disabled={keyring.locked || runner.busy}
			onchange={(enabled) => runner.run(() => setLockWithScreen(enabled))}
		/>
	</Row>
	{#each keyring.pendingImports as name (name)}
		<Row title="Bring in “{name}”" description="An older keyring with a different password. Enter it once to move everything in it here." icon={Archive}>
			<button type="button" class="button" disabled={runner.busy} onclick={() => runner.run(() => importKeyring(name))}>Bring in</button>
		</Row>
	{/each}
</Section>

{#if runner.error}
	<p class="-mt-4 px-2 text-[13px] text-[var(--danger)]">{runner.error}</p>
{/if}
