<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, PasswordField } from '@luft/ui';
	import { changePassword, type PasswordOutcome, type User } from './api';
	import StrengthMeter from './StrengthMeter.svelte';
	import { MINIMUM_LENGTH, measure } from './strength';

	interface Props {
		user: User;
		onclose: () => void;
	}

	const REJECTIONS: Record<Exclude<PasswordOutcome, 'changed' | 'wrongPassword'>, string> = {
		tooShort: 'settings-users-password-too-short',
		tooSimilar: 'settings-users-password-too-similar',
		dictionaryWord: 'settings-users-password-dictionary-word',
		tooSimple: 'settings-users-password-too-simple',
		rejected: 'settings-users-password-rejected'
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
	let wrong = $derived(current === rejectedCurrent ? t('settings-users-password-wrong') : '');
	let refused = $derived(rejection?.password === password ? t(rejection.message) : '');
	let mismatch = $derived(confirmation.length >= password.length && confirmation !== password ? t('settings-users-password-mismatch') : '');
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
	title={user.hasPassword ? t('settings-users-password-change-title') : t('settings-users-password-set-title')}
	description={t('settings-users-password-dialog-description')}
	{onclose}
>
	{#if user.hasPassword}
		<PasswordField label={t('settings-users-password-current')} showLabel bind:value={current} autocomplete="current-password" error={wrong} live onkeydown={enter} />
	{/if}
	<div class="flex flex-col gap-2">
		<PasswordField label={t('settings-users-password-new')} showLabel bind:value={password} placeholder={t('settings-users-password-new-placeholder', { count: MINIMUM_LENGTH })} autocomplete="new-password" error={refused} live onkeydown={enter} />
		{#if strength}
			<StrengthMeter {strength} />
		{/if}
	</div>
	<PasswordField label={t('settings-users-password-confirm')} showLabel bind:value={confirmation} placeholder={t('settings-users-password-confirm-placeholder')} autocomplete="new-password" error={mismatch} live onkeydown={enter} />
	{#if problem}
		<p class="text-[13px] text-[var(--danger)]">{problem}</p>
	{/if}
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>{t('settings-users-cancel')}</button>
		<button type="button" class="button primary" disabled={!ready} onclick={submit}>{busy ? t('settings-users-password-changing') : t('settings-users-password-change')}</button>
	{/snippet}
</Dialog>
