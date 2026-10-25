<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section, Switch } from '@luft/ui';
	import { app } from '#lib/state/app.svelte.js';
	import { lock, reseal, setLockWithScreen, setPin, unlock, type Keyring } from './api';
	import { protection, sealed } from './describe';
	import { Runner } from './runner.svelte';

	interface Props {
		keyring: Keyring;
		fingerprintReader: boolean;
		refresh: () => Promise<void>;
		onaccess: () => void;
	}

	let { keyring, fingerprintReader, refresh, onaccess }: Props = $props();

	const runner = new Runner(() => refresh());

	let chipSealed = $derived(sealed(keyring));
	let resealable = $derived(keyring.chip === 'ready' && !keyring.tpmSealed);
	let fingerprints = $derived(fingerprintReader && chipSealed);
</script>

<Section>
	<Row title={keyring.locked ? t('settings-passwords-locked') : t('settings-passwords-contents', { count: keyring.itemCount })} description={protection(keyring)}>
		{#if keyring.locked}
			<button type="button" class="button" disabled={runner.busy} onclick={() => runner.run(unlock)}>{t('settings-passwords-unlock')}</button>
		{:else}
			<button type="button" class="button" disabled={runner.busy} onclick={() => runner.run(lock)}>{t('settings-passwords-lock')}</button>
		{/if}
	</Row>
	{#if resealable}
		<Row title={t('settings-passwords-seal-title')} description={t('settings-passwords-seal-description')}>
			<button type="button" class="button" disabled={runner.busy || keyring.locked} onclick={() => runner.run(reseal)}>{t('settings-passwords-seal')}</button>
		</Row>
	{/if}
	{#if fingerprints && keyring.fingerprintUnlock}
		<Row title={t('settings-passwords-fingerprint-on')} description={t('settings-passwords-fingerprint-on-description')} />
	{:else if fingerprints}
		<Row title={t('settings-passwords-fingerprint')} description={t('settings-passwords-fingerprint-description')} onclick={() => app.open('accounts')} />
	{/if}
	{#if fingerprints && (keyring.fingerprintUnlock || keyring.pin)}
		<Row
			title={t('settings-passwords-pin')}
			description={keyring.locked ? t('settings-passwords-pin-locked') : t('settings-passwords-pin-description')}
		>
			<Switch
				label={t('settings-passwords-pin')}
				checked={keyring.pin}
				disabled={keyring.locked || runner.busy}
				onchange={(enabled) => runner.run(() => setPin(enabled))}
			/>
		</Row>
	{/if}
	<Row title={t('settings-passwords-lock-with-screen')} description={t('settings-passwords-lock-with-screen-description')}>
		<Switch
			label={t('settings-passwords-lock-with-screen')}
			checked={keyring.lockWithScreen}
			disabled={keyring.locked || runner.busy}
			onchange={(enabled) => runner.run(() => setLockWithScreen(enabled))}
		/>
	</Row>
	<Row
		title={t('settings-passwords-apps')}
		description={keyring.locked ? t('settings-passwords-apps-locked') : t('settings-passwords-apps-description')}
		disabled={keyring.locked}
		onclick={onaccess}
	/>
</Section>

{#if runner.error}
	<p class="-mt-4 px-2 text-[13px] text-[var(--danger)]">{runner.error}</p>
{/if}
