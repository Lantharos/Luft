<script lang="ts">
	import { onDestroy } from 'svelte';
	import KeyRound from '@lucide/svelte/icons/key-round';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash from '@lucide/svelte/icons/trash';
	import { Dialog, IconButton, Row, Section } from '@luft/ui';
	import { ago } from '$lib/panels/updates/time';
	import { accountLabel, deletePasskey, onPasskeys, passkeys, siteLabel, type Passkey, type Passkeys } from './passkeys/api';
	import RenameDialog from './passkeys/RenameDialog.svelte';

	const PROTECTION = {
		chip: 'Saved on this computer and sealed by its security chip. Each sign-in needs your fingerprint or password.',
		password: 'Saved on this computer and encrypted with your password, because there’s no security chip to seal them with. Each sign-in needs your fingerprint or password.',
		unavailable: 'Your keyring is locked, so your passkeys can’t be shown right now.'
	};

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
	<Section title="Passkeys" description={PROTECTION[current.protection]}>
		{#if !current.ready && current.protection !== 'unavailable'}
			<Row title="Browsers can’t reach your passkeys right now" description="They’ll be back once the passkey service for browsers is running." />
		{/if}
		{#each sorted as passkey (passkey.id)}
			<Row title={siteLabel(passkey)} description={details(passkey)} icon={KeyRound}>
				<IconButton icon={Pencil} label="Rename passkey for {siteLabel(passkey)}" onclick={() => (renaming = passkey)} />
				<IconButton icon={Trash} label="Remove passkey for {siteLabel(passkey)}" onclick={() => (removing = passkey)} />
			</Row>
		{:else}
			{#if current.protection !== 'unavailable'}
				<Row title="No passkeys yet" description="When a site offers to create a passkey, it’s saved here and works in every browser on this computer." />
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
		description="You won’t be able to sign in to {siteLabel(passkey)} with it anymore. Make sure you have another way to sign in first."
		onclose={() => (removing = null)}
	>
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (removing = null)}>Cancel</button>
			<button type="button" class="button danger" onclick={() => remove(passkey)}>Remove</button>
		{/snippet}
	</Dialog>
{/if}
