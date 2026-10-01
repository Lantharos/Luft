<script lang="ts">
	import { onDestroy } from 'svelte';
	import KeyRound from '@lucide/svelte/icons/key-round';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash from '@lucide/svelte/icons/trash';
	import { Dialog, IconButton, Row, Section } from '@luft/ui';
	import { ago } from '$lib/panels/updates/time';
	import { accountLabel, deletePasskey, onPasskeys, passkeys, siteLabel, type Passkey, type Passkeys } from './passkeys/api';
	import RenameDialog from './passkeys/RenameDialog.svelte';

	const SEALED = {
		chip: 'Sealed by this computer’s security chip.',
		password: 'Encrypted with your password.'
	};

	let { fingerprintReader }: { fingerprintReader: boolean } = $props();

	let current = $state<Passkeys | null>(null);
	let renaming = $state<Passkey | null>(null);
	let removing = $state<Passkey | null>(null);
	let problem = $state('');

	let sorted = $derived(
		current ? [...current.passkeys].sort((a, b) => siteLabel(a).localeCompare(siteLabel(b)) || accountLabel(a).localeCompare(accountLabel(b))) : []
	);

	const stop = onPasskeys((next) => (current = next));
	onDestroy(stop);

	async function load() {
		current = await passkeys().catch(() => null);
	}

	function protection({ protection }: Passkeys) {
		if (protection === 'unavailable') return 'Unlock your keyring to see your passkeys.';
		return `${SEALED[protection]} Each sign-in asks for your ${fingerprintReader ? 'fingerprint or password' : 'password'}.`;
	}

	function details(passkey: Passkey) {
		const parts = [accountLabel(passkey), passkey.used ? `Last used ${ago(passkey.used)}` : 'Never used'];
		if (current?.protection === 'chip' && !passkey.chip) parts.push('Protected by your password');
		return parts.filter(Boolean).join(' · ');
	}

	async function remove(passkey: Passkey) {
		removing = null;
		problem = '';
		try {
			await deletePasskey(passkey.id);
		} catch (reason) {
			problem = reason instanceof Error ? reason.message : String(reason);
		}
		await load();
	}

	void load();
</script>

{#if current}
	<Section title="Passkeys" description={protection(current)}>
		{#if !current.ready && current.protection !== 'unavailable'}
			<Row title="Browsers can’t reach your passkeys" description="They’re back once the passkey service is running" />
		{/if}
		{#each sorted as passkey (passkey.id)}
			<Row title={siteLabel(passkey)} description={details(passkey)} icon={KeyRound} truncate>
				<IconButton icon={Pencil} label="Rename passkey for {siteLabel(passkey)}" onclick={() => (renaming = passkey)} />
				<IconButton icon={Trash} label="Remove passkey for {siteLabel(passkey)}" onclick={() => (removing = passkey)} />
			</Row>
		{:else}
			{#if current.protection !== 'unavailable'}
				<Row title="No passkeys yet" description="Ones that sites create are saved here for every browser" />
			{/if}
		{/each}
	</Section>

	{#if problem}
		<p class="-mt-4 px-2 text-[13px] text-[var(--danger)]">{problem}</p>
	{/if}
{/if}

{#if renaming}
	<RenameDialog passkey={renaming} onclose={() => (renaming = null)} />
{/if}

{#if removing}
	{@const passkey = removing}
	<Dialog
		title="Remove this passkey?"
		description="You won’t be able to sign in to {siteLabel(passkey)} with it anymore, so make sure you have another way in."
		onclose={() => (removing = null)}
	>
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (removing = null)}>Cancel</button>
			<button type="button" class="button danger" onclick={() => remove(passkey)}>Remove</button>
		{/snippet}
	</Dialog>
{/if}
