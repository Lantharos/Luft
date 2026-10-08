<script lang="ts">
	import Power from '@lucide/svelte/icons/power';
	import { Row } from '@luft/ui';
	import { cancelSigningKey, enrollSigningKey, installSignedStartup, problem, restart, type SigningKey, type Startup } from '../api';
	import SigningKeyDialog from './SigningKeyDialog.svelte';

	const PURPOSE = 'Only lets software signed for this computer start it';

	let { key, startup }: { key: SigningKey; startup: Startup } = $props();

	let code = $state<string | null>(null);
	let busy = $state(false);
	let error = $state('');

	let step = $derived.by(() => {
		if (startup.installed) return startup.measured ? 'on' : 'restart';
		if (key.state === 'enrolled') return startup.available ? 'install' : null;
		if (key.state === 'pending') return 'pending';
		return key.available ? 'enroll' : null;
	});

	let description = $derived.by(() => {
		if (step === 'restart') return 'Starts being used after you restart';
		if (step === 'pending') return key.missed ? 'The key wasn’t added at the last restart' : 'Add the key on the blue screen when you restart';
		if (step === 'enroll' && key.missed) return 'The key wasn’t added after a few restarts';
		return PURPOSE;
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

{#snippet failure()}
	<p class="pl-[34px] text-[12.5px] text-[var(--danger)]">{error}</p>
{/snippet}

{#if step === 'on'}
	<Row title="Signed startup" description="The boot menu and system are signed for this computer" icon={Power} />
{:else if step}
	<Row title="Signed startup" {description} icon={Power} below={error ? failure : undefined}>
		{#if step === 'restart'}
			<button type="button" class="button" disabled={busy} onclick={() => attempt(restart)}>Restart</button>
		{:else if step === 'install'}
			<button type="button" class="button" disabled={busy} onclick={() => attempt(installSignedStartup)}>Turn on</button>
		{:else if step === 'pending'}
			<button type="button" class="button" disabled={busy} onclick={() => attempt(cancelSigningKey)}>Cancel</button>
			<button type="button" class="button" disabled={busy} onclick={addKey}>Show steps</button>
		{:else}
			<button type="button" class="button" disabled={busy} onclick={addKey}>{key.missed ? 'Try again' : 'Set up'}</button>
		{/if}
	</Row>
{/if}

{#if code}
	<SigningKeyDialog {code} onclose={() => (code = null)} />
{/if}
