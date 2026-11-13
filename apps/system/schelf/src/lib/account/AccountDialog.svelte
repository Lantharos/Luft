<script lang="ts">
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { Dialog, Spinner } from '@luft/ui';
	import type { Invitation } from '#lib/bindings.js';
	import { openUrl } from '#lib/bridge/index.js';
	import { account } from '#lib/state/account.svelte.js';
	import { openListing } from '#lib/state/app.js';
	import { channelName } from './channels.js';

	const step = $derived(account.signIn);
	const signedIn = $derived(account.signedIn);
	const invitations = $derived(account.state?.invitations ?? []);

	const title = $derived(signedIn ? signedIn.name || signedIn.email : step.step === 'waiting' ? 'Approve in your browser' : 'Sign in to schelf.store');
	const description = $derived.by(() => {
		if (signedIn) return signedIn.name ? signedIn.email : undefined;
		switch (step.step) {
			case 'waiting':
				return 'Check that the page shows this code, then approve it.';
			case 'declined':
				return 'The sign-in was declined in the browser.';
			case 'expired':
				return 'The code ran out before it was approved.';
			case 'failed':
				return step.error;
			default:
				return 'Get the apps and versions you were invited to try.';
		}
	});

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
		{#if invitations.length}
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
			<p class="text-[13px] text-[var(--text-muted)]">You aren't invited to anything yet.</p>
		{/if}
	{:else if step.step === 'waiting'}
		<p class="code">{step.approval.code}</p>
	{/if}
	{#snippet actions()}
		{#if signedIn}
			<button type="button" class="button" onclick={signOut}>Sign out</button>
			<button type="button" class="button primary" onclick={() => account.close()}>Done</button>
		{:else if step.step === 'waiting'}
			{@const page = step.approval.page}
			<button type="button" class="button" onclick={() => account.close()}>Cancel</button>
			<button type="button" class="button primary" onclick={() => openUrl(page)}>Open the page again</button>
		{:else}
			<button type="button" class="button" onclick={() => account.close()}>Cancel</button>
			<button type="button" class="button primary" disabled={step.step === 'starting'} onclick={() => account.begin()}>
				{#if step.step === 'starting'}
					<Spinner size={14} />
				{/if}
				{step.step === 'idle' || step.step === 'starting' ? 'Sign in' : 'Try again'}
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
