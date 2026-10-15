<script lang="ts">
	import { PasswordField, TextField } from '@luft/ui';
	import StepFrame from '#lib/components/StepFrame.svelte';
	import { flow } from '#lib/state/flow.svelte.js';
	import { install } from '#lib/state/install.svelte.js';

	const USER_NAME = /^[a-z_][a-z0-9_-]{0,31}$/;

	let fullName = $state(install.survey?.meet?.movingBox?.fullName ?? '');
	let userName = $state('');
	let editedUserName = $state(false);
	let password = $state('');
	let repeated = $state('');
	let saving = $state(false);
	let problem = $state('');

	let suggested = $derived(
		fullName
			.trim()
			.split(/\s+/)[0]
			.normalize('NFD')
			.replace(/[^\p{ASCII}]/gu, '')
			.toLowerCase()
			.replace(/[^a-z0-9_-]/g, '')
			.replace(/^[^a-z_]+/, '')
	);
	$effect(() => {
		if (!editedUserName) userName = suggested;
	});

	let nameError = $derived(userName && !USER_NAME.test(userName) ? 'Use lowercase letters, numbers, - and _' : '');
	let fullNameError = $derived(/[:,\n]/.test(fullName) ? 'Leave out commas and colons' : '');
	let repeatError = $derived(repeated && repeated !== password ? 'The passwords don’t match' : '');
	let ready = $derived(Boolean(fullName.trim() && userName && !nameError && !fullNameError && password && repeated === password));

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (!ready || saving) return;
		saving = true;
		problem = '';
		try {
			await install.createAccount(userName, fullName.trim(), password);
			flow.next();
		} catch (error) {
			problem = String(error);
		} finally {
			saving = false;
		}
	}
</script>

<form class="contents" onsubmit={submit}>
	<StepFrame title="Who’s using this computer?" description="This is the account you sign in with. You can add more people later in Settings.">
		<div class="grid max-w-[520px] gap-3">
			<TextField bind:value={fullName} label="Your name" showLabel placeholder="Ada Lovelace" autocomplete="name" error={fullNameError} live />
			<TextField bind:value={userName} label="User name" showLabel error={nameError} live onkeydown={() => (editedUserName = true)} />
			<PasswordField bind:value={password} label="Password" showLabel autocomplete="new-password" />
			<PasswordField bind:value={repeated} label="Type it again" showLabel autocomplete="new-password" error={repeatError} live />
			{#if problem}
				<p class="text-[13.5px] text-[var(--danger)]">{problem}</p>
			{/if}
		</div>
		{#snippet actions()}
			<button type="submit" class="button primary large px-6" disabled={!ready || saving}>{saving ? 'Saving…' : 'Continue'}</button>
		{/snippet}
	</StepFrame>
</form>
