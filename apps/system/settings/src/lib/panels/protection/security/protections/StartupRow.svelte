<script lang="ts">
	import Power from '@lucide/svelte/icons/power';
	import { t } from '@luft/i18n';
	import { errorText, Row } from '@luft/ui';
	import type { SigningKey, Startup } from '#lib/bindings.js';
	import { installSignedStartup, restart } from '../api';

	let { key, startup, onsecureboot }: { key: SigningKey; startup: Startup; onsecureboot: () => void } = $props();

	let busy = $state(false);
	let error = $state('');

	let step = $derived.by(() => {
		if (startup.withoutKey || (!startup.installed && key.state !== 'enrolled')) {
			if (key.state === 'pending') return 'pending';
			return key.available ? 'enroll' : null;
		}
		if (startup.installed) return startup.measured ? 'on' : 'restart';
		return startup.available ? 'install' : null;
	});

	let description = $derived.by(() => {
		if (step === 'restart') return t('settings-security-signed-startup-restart');
		if (step === 'pending') return key.missed ? t('settings-security-signed-startup-retry') : t('settings-security-signed-startup-finish');
		if (step === 'enroll' && key.missed) return t('settings-security-signed-startup-gave-up');
		return t('settings-security-signed-startup-purpose');
	});

	async function attempt(action: () => Promise<unknown>) {
		busy = true;
		error = '';
		try {
			await action();
		} catch (reason) {
			error = errorText(reason);
		}
		busy = false;
	}
</script>

{#snippet failure()}
	<p class="pl-[34px] text-[12.5px] text-[var(--danger)]">{error}</p>
{/snippet}

{#if step === 'on'}
	<Row title={t('settings-security-signed-startup')} description={t('settings-security-signed-startup-on')} icon={Power} />
{:else if step === 'pending' || step === 'enroll'}
	<Row title={t('settings-security-signed-startup')} {description} icon={Power} onclick={onsecureboot} />
{:else if step}
	<Row title={t('settings-security-signed-startup')} {description} icon={Power} below={error ? failure : undefined}>
		{#if step === 'restart'}
			<button type="button" class="button" disabled={busy} onclick={() => attempt(restart)}>{t('settings-protection-restart')}</button>
		{:else}
			<button type="button" class="button" disabled={busy} onclick={() => attempt(installSignedStartup)}>{t('settings-protection-turn-on')}</button>
		{/if}
	</Row>
{/if}
