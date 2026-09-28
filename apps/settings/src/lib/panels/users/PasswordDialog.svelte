<script lang="ts">
	import { Dialog, PasswordField } from '@luft/ui';
	import { changePassword, type PasswordOutcome, type User } from './api';
	import { MINIMUM_LENGTH, measure } from './strength';

	interface Props {
		user: User;
		onclose: () => void;
	}

	const REJECTIONS: Record<Exclude<PasswordOutcome, 'changed' | 'wrongPassword'>, string> = {
		tooShort: 'This password is too short',
		tooSimilar: 'This is too similar to your current password',
		dictionaryWord: 'This is based on a dictionary word. Try something less common.',
		tooSimple: 'This is too simple. Make it longer or mix in more kinds of characters.',
		rejected: 'This password wasn’t accepted. Try a different one.'
	};

	let { user, onclose }: Props = $props();

	let current = $state('');
	let password = $state('');
	let confirmation = $state('');
	let rejectedCurrent = $state<string | null>(null);
	let rejection = $state<{ password: string; message: string } | null>(null);
	let problem = $state('');
	let busy = $state(false);

	let strength = $derived(password ? measure(password, [user.userName, ...user.realName.split(/\s+/)]) : null);
	let wrong = $derived(current === rejectedCurrent ? 'That isn’t your current password' : '');
	let refused = $derived(rejection?.password === password ? rejection.message : '');
	let mismatch = $derived(confirmation.length >= password.length && confirmation !== password ? 'The passwords don’t match' : '');
	let ready = $derived(!busy && (!user.hasPassword || current.length > 0) && password.length >= MINIMUM_LENGTH && confirmation === password);

	async function submit() {
		if (!ready) return;
		busy = true;
		problem = '';
		try {
			const outcome = await changePassword(user.hasPassword ? current : null, password);
			if (outcome === 'changed') return onclose();
			if (outcome === 'wrongPassword') rejectedCurrent = current;
			else rejection = { password, message: REJECTIONS[outcome] };
		} catch (reason) {
			problem = reason instanceof Error ? reason.message : String(reason);
		}
		busy = false;
	}

	function enter(event: KeyboardEvent) {
		if (event.key === 'Enter') void submit();
	}
</script>

<Dialog
	title={user.hasPassword ? 'Change your password' : 'Set a password'}
	description="You’ll use it to sign in and unlock this computer."
	{onclose}
>
	{#if user.hasPassword}
		<PasswordField label="Current password" showLabel bind:value={current} autocomplete="current-password" error={wrong} live onkeydown={enter} />
	{/if}
	<div class="flex flex-col gap-2">
		<PasswordField label="New password" showLabel bind:value={password} placeholder="At least 8 characters" autocomplete="new-password" error={refused} live onkeydown={enter} />
		{#if strength}
			<div class="flex flex-col gap-1.5 px-1">
				<div class="meter" aria-hidden="true">
					{#each [1, 2, 3] as step (step)}
						<span class:filled={strength.level >= step} data-level={strength.level}></span>
					{/each}
				</div>
				<p class="text-[12.5px] text-[var(--text-muted)]">{strength.label}</p>
			</div>
		{/if}
	</div>
	<PasswordField label="Confirm" showLabel bind:value={confirmation} placeholder="Type it again" autocomplete="new-password" error={mismatch} live onkeydown={enter} />
	{#if problem}
		<p class="text-[13px] text-[var(--danger)]">{problem}</p>
	{/if}
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>Cancel</button>
		<button type="button" class="button primary" disabled={!ready} onclick={submit}>{busy ? 'Changing…' : 'Change password'}</button>
	{/snippet}
</Dialog>

<style>
	.meter {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 4px;
	}

	.meter span {
		height: 4px;
		border-radius: var(--radius-pill);
		background: var(--control);
		transition: background-color 200ms var(--ease);
	}

	.meter .filled[data-level='1'] {
		background: var(--danger);
	}

	.meter .filled[data-level='2'] {
		background: var(--accent);
	}

	.meter .filled[data-level='3'] {
		background: var(--success);
	}
</style>
