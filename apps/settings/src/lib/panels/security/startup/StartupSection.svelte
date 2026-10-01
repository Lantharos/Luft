<script lang="ts">
	import { Row, Section } from '@luft/ui';
	import { cancelSigningKey, enrollSigningKey, installSignedStartup, problem, type Trust } from '../api';
	import SigningKeyDialog from './SigningKeyDialog.svelte';

	let { trust }: { trust: Trust } = $props();

	let code = $state<string | null>(null);
	let busy = $state(false);
	let error = $state('');

	let key = $derived(trust.signingKey);
	let startup = $derived(trust.startup);
	let enrolled = $derived(key.state === 'enrolled');

	let pending = $derived(key.state === 'pending');
	let missed = $derived(key.missed > 0);

	const keyDescription = $derived.by(() => {
		if (enrolled) return 'Secure Boot trusts Luft’s startup and the drivers built on this computer';
		if (!key.available) return key.reason;
		if (pending && missed) return 'It wasn’t added at the last restart, so the steps show again when you restart';
		if (pending) return 'Waiting for you to add it on the blue screen when the computer restarts';
		if (missed) return 'It wasn’t added after a few restarts. Try again whenever you’re ready';
		return 'Lets Secure Boot trust Luft’s startup and the drivers built on this computer';
	});

	const startupDescription = $derived.by(() => {
		if (!startup.available) return startup.reason;
		if (!startup.installed && !enrolled) return 'Add Luft’s signing key first. Then the computer can start through Luft’s signed boot menu, which lets the TPM unlock the disk safely.';
		return 'The computer starts through Luft’s signed boot menu, which lets the TPM unlock the disk safely';
	});

	async function attempt(action: () => Promise<unknown>) {
		busy = true;
		error = '';
		try {
			await action();
		} catch (reason) {
			error = problem(reason);
		}
		busy = false;
	}

	const addKey = () => attempt(async () => (code = await enrollSigningKey()));
</script>

<Section title="Startup">
	<Row title="Luft’s signing key" description={keyDescription}>
		{#if enrolled}
			<span>Added</span>
		{:else if pending}
			<button type="button" class="button" disabled={busy} onclick={addKey}>Show steps</button>
			<button type="button" class="button" disabled={busy} onclick={() => attempt(cancelSigningKey)}>Cancel</button>
		{:else if key.available}
			<button type="button" class="button" disabled={busy} onclick={addKey}>{missed ? 'Try again' : 'Add key'}</button>
		{/if}
	</Row>
	<Row title="Signed startup" description={startupDescription} disabled={!startup.installed && !enrolled}>
		{#if startup.installed}
			<span>{startup.measured ? 'On' : 'After you restart'}</span>
		{:else if startup.available && enrolled}
			<button type="button" class="button" disabled={busy} onclick={() => attempt(installSignedStartup)}>Turn on</button>
		{/if}
	</Row>
</Section>

{#if error}
	<p class="-mt-4 px-2 text-[13px] text-[var(--danger)]">{error}</p>
{/if}

{#if code}
	<SigningKeyDialog {code} onclose={() => (code = null)} />
{/if}
