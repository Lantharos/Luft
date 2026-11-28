<script lang="ts">
	import { t } from '@luft/i18n';
	import IdCard from '@luft/symbols/icons/id-card';
	import SecurityKey from '@luft/symbols/icons/security-key';
	import Trash from '@luft/symbols/icons/trash';
	import { Dialog, IconButton, Row, Section, Switch } from '@luft/ui';
	import { commands, type SignInEnrolled, type SignInMethods } from '#lib/bindings.js';
	import CardDialog from './CardDialog.svelte';
	import KeyDialog from './KeyDialog.svelte';
	import { attempt, WAIT_FOR_PERMISSION } from './refusals';

	type Removing = { kind: 'key' | 'card'; entry: SignInEnrolled };

	let methods = $state<SignInMethods | null>(null);
	let adding = $state<'key' | 'card' | null>(null);
	let removing = $state<Removing | null>(null);
	let turningOff = $state(false);
	let problem = $state('');

	async function load() {
		methods = await commands.signInMethods().catch(() => null);
	}

	async function change(run: () => ReturnType<typeof commands.signInSetPassword>) {
		problem = (await attempt(run)) ?? '';
		await load();
	}

	async function remove({ kind, entry }: Removing) {
		removing = null;
		await change(() => (kind === 'key' ? commands.signInRemoveKey({ id: entry.id }) : commands.signInRemoveCard({ id: entry.id })));
	}

	async function setPassword(allowed: boolean) {
		turningOff = false;
		await change(() => commands.signInSetPassword({ allowed }, { timeoutMs: WAIT_FOR_PERMISSION }));
	}

	function finish() {
		adding = null;
		void load();
	}

	void load();
</script>

{#if methods}
	<Section title={t('settings-users-keys')}>
		{#each methods.securityKeys as key (key.id)}
			<Row title={key.name || t('settings-users-keys-key')} icon={SecurityKey}>
				<IconButton icon={Trash} label={t('settings-users-keys-remove-key')} onclick={() => (removing = { kind: 'key', entry: key })} />
			</Row>
		{/each}
		{#each methods.smartCards as card (card.id)}
			<Row title={card.name || t('settings-users-keys-card')} icon={IdCard}>
				<IconButton icon={Trash} label={t('settings-users-keys-remove-card')} onclick={() => (removing = { kind: 'card', entry: card })} />
			</Row>
		{/each}
		<Row title={t('settings-users-keys-add-key')} icon={methods.securityKeys.length ? undefined : SecurityKey} onclick={() => (adding = 'key')} />
		<Row title={t('settings-users-keys-add-card')} icon={methods.smartCards.length ? undefined : IdCard} onclick={() => (adding = 'card')} />
		<Row
			title={t('settings-users-keys-password')}
			description={methods.password && !methods.canTurnOffPassword ? t('settings-users-keys-password-needs-another') : undefined}
		>
			<Switch
				checked={methods.password}
				label={t('settings-users-keys-password')}
				disabled={methods.password && !methods.canTurnOffPassword}
				onchange={(allowed) => (allowed ? void setPassword(true) : (turningOff = true))}
			/>
		</Row>
	</Section>

	{#if problem}
		<p class="-mt-4 px-2 text-[13px] text-[var(--danger)]">{problem}</p>
	{/if}
{/if}

{#if adding === 'key'}
	<KeyDialog onclose={finish} />
{:else if adding === 'card'}
	<CardDialog onclose={finish} />
{/if}

{#if removing}
	{@const chosen = removing}
	<Dialog
		title={chosen.kind === 'key' ? t('settings-users-keys-remove-key-title') : t('settings-users-keys-remove-card-title')}
		description={methods?.password ? undefined : t('settings-users-keys-remove-last')}
		onclose={() => (removing = null)}
	>
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (removing = null)}>{t('settings-users-cancel')}</button>
			<button type="button" class="button danger" onclick={() => remove(chosen)}>{t('settings-users-remove')}</button>
		{/snippet}
	</Dialog>
{/if}

{#if turningOff}
	<Dialog title={t('settings-users-keys-password-off-title')} description={t('settings-users-keys-password-off-description')} onclose={() => (turningOff = false)}>
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (turningOff = false)}>{t('settings-users-cancel')}</button>
			<button type="button" class="button primary" onclick={() => setPassword(false)}>{t('settings-users-keys-password-off')}</button>
		{/snippet}
	</Dialog>
{/if}
