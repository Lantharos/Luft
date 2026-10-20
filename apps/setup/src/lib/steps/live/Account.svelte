<script lang="ts">
	import { t } from '@luft/i18n';
	import { PasswordField, TextField } from '@luft/ui';
	import StepFrame from '#lib/components/StepFrame.svelte';
	import { flow } from '#lib/state/flow.svelte.js';
	import { install } from '#lib/state/install.svelte.js';

	const USER_NAME = /^[a-z_][a-z0-9_-]{0,31}$/;

	let kept = install.replacing?.owner ?? null;
	let fullName = $state(kept?.fullName ?? install.survey?.meet?.movingBox?.fullName ?? '');
	let userName = $state(kept?.name ?? '');
	let editedUserName = $state(!!kept);
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

	let nameError = $derived(userName && !USER_NAME.test(userName) ? t('setup-account-user-name-invalid') : '');
	let fullNameError = $derived(/[:,\n]/.test(fullName) ? t('setup-account-full-name-invalid') : '');
	let repeatError = $derived(repeated && repeated !== password ? t('setup-account-mismatch') : '');
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
	<StepFrame title={t('setup-account-title')} description={t('setup-account-description')} hideBack={saving}>
		<div class="grid max-w-[520px] gap-3">
			<TextField bind:value={fullName} label={t('setup-account-full-name')} showLabel placeholder={t('setup-account-full-name-example')} autocomplete="name" error={fullNameError} live />
			<TextField bind:value={userName} label={t('setup-account-user-name')} showLabel error={nameError} live onkeydown={() => (editedUserName = true)} />
			<PasswordField bind:value={password} label={t('setup-account-password')} showLabel autocomplete="new-password" />
			<PasswordField bind:value={repeated} label={t('setup-account-repeat')} showLabel autocomplete="new-password" error={repeatError} live />
			{#if problem}
				<p class="text-[13.5px] text-[var(--danger)]">{problem}</p>
			{/if}
		</div>
		{#snippet actions()}
			<button type="submit" class="button primary large px-6" disabled={!ready || saving}>{t(saving ? 'setup-saving' : 'setup-continue')}</button>
		{/snippet}
	</StepFrame>
</form>
