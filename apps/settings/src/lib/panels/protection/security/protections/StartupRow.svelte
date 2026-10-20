<script lang="ts">
	import Power from '@lucide/svelte/icons/power';
	import { t } from '@luft/i18n';
	import { Row } from '@luft/ui';
	import { cancelSigningKey, enrollSigningKey, installSignedStartup, problem, restart, type SigningKey, type Startup } from '../api';
	import KeyStepsDialog from './KeyStepsDialog.svelte';

	let { key, startup }: { key: SigningKey; startup: Startup } = $props();

	let code = $state<string | null>(null);
	let busy = $state(false);
	let error = $state('');

	let step = $derived.by(() => {
		if (startup.installed) return startup.measured ? 'on' : 'restart';
		if (key.state === 'enrolled') return startup.available ? 'install' : null;
		if (key.state === 'pending') return 'pending';
		return key.available ? 'enroll' : null;
	});

	let description = $derived.by(() => {
		if (step === 'restart') return t('settings-security-signed-startup-restart');
		if (step === 'pending') return key.missed ? t('settings-security-signed-startup-missed') : t('settings-security-signed-startup-pending');
		if (step === 'enroll' && key.missed) return t('settings-security-signed-startup-missed-often');
		return t('settings-security-signed-startup-purpose');
	});

	async function attempt(action: () => Promise<unknown>) {
		busy = true;
		error = '';
		try {
			await action();
		} catch (reason) {
			error = problem(reason);
		}
		busy = false;
	}

	const addKey = () => attempt(async () => (code = await enrollSigningKey()));
</script>

{#snippet failure()}
	<p class="pl-[34px] text-[12.5px] text-[var(--danger)]">{error}</p>
{/snippet}

{#if step === 'on'}
	<Row title={t('settings-security-signed-startup')} description={t('settings-security-signed-startup-on')} icon={Power} />
{:else if step}
	<Row title={t('settings-security-signed-startup')} {description} icon={Power} below={error ? failure : undefined}>
		{#if step === 'restart'}
			<button type="button" class="button" disabled={busy} onclick={() => attempt(restart)}>{t('settings-protection-restart')}</button>
		{:else if step === 'install'}
			<button type="button" class="button" disabled={busy} onclick={() => attempt(installSignedStartup)}>{t('settings-protection-turn-on')}</button>
		{:else if step === 'pending'}
			<button type="button" class="button" disabled={busy} onclick={() => attempt(cancelSigningKey)}>{t('settings-protection-cancel')}</button>
			<button type="button" class="button" disabled={busy} onclick={addKey}>{t('settings-security-show-steps')}</button>
		{:else}
			<button type="button" class="button" disabled={busy} onclick={addKey}>{key.missed ? t('settings-security-try-again') : t('settings-protection-set-up')}</button>
		{/if}
	</Row>
{/if}

{#if code}
	<KeyStepsDialog {code} onclose={() => (code = null)} />
{/if}
