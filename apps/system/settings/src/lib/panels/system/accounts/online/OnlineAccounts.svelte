<script lang="ts">
	import { onDestroy } from 'svelte';
	import Plus from '@luft/symbols/icons/plus';
	import { t } from '@luft/i18n';
	import { ActionRow, Row, Section } from '@luft/ui';
	import { commands, events } from '#lib/bindings.js';
	import type { Account, OnlineAccounts } from '#lib/bindings.js';
	import { app } from '#lib/state/app.svelte.js';
	import AccountRow from './AccountRow.svelte';
	import SignInDialog from './SignInDialog.svelte';

	let online = $state<OnlineAccounts | undefined>();
	let adding = $state(false);
	let again = $state<Account | null>(null);

	const stop = events.accountsChanged((snapshot) => (online = { state: 'ready', snapshot }));
	onDestroy(stop);

	$effect(() => {
		if (app.section !== 'add' || online === undefined) return;
		app.section = null;
		adding = true;
	});

	void commands.accounts().then((next) => (online = next));
</script>

{#if online?.state === 'ready'}
	{@const snapshot = online.snapshot}
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
{:else if online}
	<Section title={t('settings-accounts-online')}>
		{#if online.state === 'notInstalled'}
			<Row title={t('settings-accounts-unavailable')} description={t('settings-accounts-unavailable.description')} />
		{:else if online.state === 'refused'}
			<Row title={t('settings-accounts-refused')} description={t('settings-accounts-refused.description')} />
		{:else}
			<Row title={t('settings-accounts-failed')} description={online.error} />
		{/if}
	</Section>
{/if}

{#if adding}
	<SignInDialog onclose={() => (adding = false)} />
{/if}

{#if again}
	<SignInDialog again={again} onclose={() => (again = null)} />
{/if}
