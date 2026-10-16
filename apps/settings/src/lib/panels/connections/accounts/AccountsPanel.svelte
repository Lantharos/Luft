<script lang="ts">
	import { onDestroy } from 'svelte';
	import Plus from '@lucide/svelte/icons/plus';
	import { ActionRow, Row, Section } from '@luft/ui';
	import { app } from '#lib/state/app.svelte.js';
	import AccountRow from './AccountRow.svelte';
	import { accounts, onAccounts, type Account, type Snapshot } from './api';
	import SignInDialog from './SignInDialog.svelte';

	let snapshot = $state<Snapshot | null | undefined>();
	let adding = $state(false);
	let again = $state<Account | null>(null);

	const stop = onAccounts((next) => (snapshot = next));
	onDestroy(stop);

	$effect(() => {
		if (app.section !== 'add' || snapshot === undefined) return;
		app.section = null;
		adding = true;
	});

	void accounts()
		.then((next) => (snapshot = next))
		.catch(() => (snapshot = null));
</script>

{#if snapshot === null}
	<Section title="Accounts">
		<Row title="Accounts aren’t available" description="The accounts service isn’t installed on this computer" />
	</Section>
{:else if snapshot}
	<Section title="Online accounts" description="Each account is a folder in Cloud, in your home folder, that every app can open. Files download when you open them.">
		{#each snapshot.accounts as account (account.id)}
			<AccountRow {account} drive={snapshot.drives.find((drive) => drive.account === account.id)} onsigninagain={() => (again = account)} />
		{/each}
		<ActionRow title="Add an account" description="iCloud Drive, OneDrive, Dropbox, Nextcloud or WebDAV" icon={Plus} onclick={() => (adding = true)} />
	</Section>
{/if}

{#if adding}
	<SignInDialog onclose={() => (adding = false)} />
{/if}

{#if again}
	<SignInDialog again={again} onclose={() => (again = null)} />
{/if}
