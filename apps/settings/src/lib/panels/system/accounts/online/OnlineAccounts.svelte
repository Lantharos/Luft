<script lang="ts">
	import { onDestroy } from 'svelte';
	import Plus from '@lucide/svelte/icons/plus';
	import { t } from '@luft/i18n';
	import { ActionRow, Row, Section } from '@luft/ui';
	import { commands, events } from '#lib/bindings.js';
	import type { Account, AccountsSnapshot } from '#lib/bindings.js';
	import { app } from '#lib/state/app.svelte.js';
	import AccountRow from './AccountRow.svelte';
	import SignInDialog from './SignInDialog.svelte';

	let snapshot = $state<AccountsSnapshot | null | undefined>();
	let adding = $state(false);
	let again = $state<Account | null>(null);

	const stop = events.accountsChanged((next) => (snapshot = next));
	onDestroy(stop);

	$effect(() => {
		if (app.section !== 'add' || snapshot === undefined) return;
		app.section = null;
		adding = true;
	});

	void commands.accounts()
		.then((next) => (snapshot = next))
		.catch(() => (snapshot = null));
</script>

{#if snapshot === null}
	<Section title={t('settings-accounts-online')}>
		<Row title={t('settings-accounts-unavailable')} description={t('settings-accounts-unavailable.description')} />
	</Section>
{:else if snapshot}
	<Section title={t('settings-accounts-online')} description={t('settings-accounts-online.description')}>
		{#each snapshot.accounts as account (account.id)}
			<AccountRow {account} drive={snapshot.drives.find((drive) => drive.account === account.id)} onsigninagain={() => (again = account)} />
		{/each}
		<ActionRow
			title={t('settings-page-add-account')}
			description={t('settings-accounts-add-description')}
			icon={Plus}
			onclick={() => (adding = true)}
		/>
	</Section>
{/if}

{#if adding}
	<SignInDialog onclose={() => (adding = false)} />
{/if}

{#if again}
	<SignInDialog again={again} onclose={() => (again = null)} />
{/if}
