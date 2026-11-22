<script lang="ts">
	import Check from '@luft/symbols/icons/check';
	import ChevronRight from '@luft/symbols/icons/chevron-right';
	import { t } from '@luft/i18n';
	import { Dialog, Spinner } from '@luft/ui';
	import type { Invitation } from '#lib/bindings.js';
	import { openUrl } from '#lib/bridge/index.js';
	import PublisherMark from '#lib/developer/components/PublisherMark.svelte';
	import { developer } from '#lib/developer/state/developer.svelte.js';
	import { account } from '#lib/state/account.svelte.js';
	import { navigation } from '#lib/state/navigation.svelte.js';
	import { openListing } from '#lib/state/app.js';
	import { channelName } from './channels.js';

	const step = $derived(account.signIn);
	const signedIn = $derived(account.signedIn);
	const invitations = $derived(account.state?.invitations ?? []);
	const publishers = $derived(navigation.developing && developer.publishers.length > 1 ? developer.publishers : []);

	const title = $derived(signedIn ? signedIn.name || signedIn.email : step.step === 'waiting' ? t('account-approve-title') : t('account-sign-in-title'));
	const description = $derived.by(() => {
		if (signedIn) return signedIn.name ? signedIn.email : undefined;
		switch (step.step) {
			case 'waiting':
				return t('account-approve-description');
			case 'declined':
				return t('account-declined');
			case 'expired':
				return t('account-expired');
			case 'failed':
				return step.error;
			default:
				return t('account-sign-in-description');
		}
	});

	function choose(publisher: string) {
		account.close();
		void developer.choose(publisher);
	}

	function open(invitation: Invitation) {
		account.close();
		void openListing(invitation.app);
	}

	async function signOut() {
		await account.signOut();
		account.close();
	}
</script>

<Dialog {title} {description} onclose={() => account.close()}>
	{#if signedIn}
		{#if publishers.length}
			<ul class="-mx-2 flex flex-col">
				{#each publishers as publisher (publisher.id)}
					<li>
						<button type="button" class="invitation" onclick={() => choose(publisher.id)}>
							<PublisherMark {publisher} size={24} />
							<span class="min-w-0 flex-1 truncate">{publisher.name}</span>
							{#if publisher.id === developer.publisher?.id}
								<Check size={16} class="text-[var(--accent)]" />
							{/if}
						</button>
					</li>
				{/each}
			</ul>
		{:else if invitations.length}
			<ul class="-mx-2 flex flex-col">
				{#each invitations as invitation (`${invitation.app}/${invitation.channel}`)}
					<li>
						<button type="button" class="invitation" onclick={() => open(invitation)}>
							<span class="min-w-0 flex-1 truncate">{invitation.name}</span>
							<span class="text-[13px] text-[var(--text-muted)]">{channelName(invitation.channel)}</span>
							<ChevronRight size={16} class="text-[var(--text-muted)]" />
						</button>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-[13px] text-[var(--text-muted)]">{t('account-no-invitations')}</p>
		{/if}
	{:else if step.step === 'waiting'}
		<p class="code select-text">{step.approval.code}</p>
	{/if}
	{#snippet actions()}
		{#if signedIn}
			<button type="button" class="button" onclick={signOut}>{t('account-sign-out')}</button>
			<button type="button" class="button primary" onclick={() => account.close()}>{t('account-done')}</button>
		{:else if step.step === 'waiting'}
			{@const page = step.approval.page}
			<button type="button" class="button" onclick={() => account.close()}>{t('account-cancel')}</button>
			<button type="button" class="button primary" onclick={() => openUrl(page)}>{t('account-open-page')}</button>
		{:else}
			<button type="button" class="button" onclick={() => account.close()}>{t('account-cancel')}</button>
			<button type="button" class="button primary" disabled={step.step === 'starting'} onclick={() => account.begin()}>
				{#if step.step === 'starting'}
					<Spinner size={14} />
				{/if}
				{step.step === 'idle' || step.step === 'starting' ? t('account-sign-in') : t('account-try-again')}
			</button>
		{/if}
	{/snippet}
</Dialog>

<style>
	.invitation {
		display: flex;
		width: 100%;
		height: 40px;
		align-items: center;
		gap: 10px;
		border-radius: var(--radius-pill);
		padding-inline: 8px;
		text-align: left;
		font-size: 14px;
		transition: background-color var(--motion-tap) var(--ease-decelerate);
	}

	.invitation:hover {
		background: var(--control);
	}

	.code {
		padding-block: 6px;
		text-align: center;
		font-family: var(--font-mono);
		font-size: 30px;
		font-weight: 600;
		letter-spacing: 0.08em;
	}
</style>
