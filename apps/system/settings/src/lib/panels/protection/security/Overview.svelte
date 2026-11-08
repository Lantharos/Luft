<script lang="ts">
	import HardDrive from '@lucide/svelte/icons/hard-drive';
	import KeyRound from '@lucide/svelte/icons/key-round';
	import ShieldAlert from '@lucide/svelte/icons/shield-alert';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import TerminalSquare from '@lucide/svelte/icons/square-terminal';
	import { t } from '@luft/i18n';
	import { ActionRow, Section } from '@luft/ui';
	import HeroCard from '#lib/components/HeroCard.svelte';
	import { encryptionSummary } from './encryption/describe';
	import { protection } from './keyring/describe';
	import type { KeyringState } from './keyring/state.svelte';
	import ProtectionsSection from './protections/ProtectionsSection.svelte';
	import { remoteLoginSummary } from './remote/describe';
	import type { RemoteLoginState } from './remote/state.svelte';
	import type { SecurityState } from './state.svelte';
	import { summarize } from './summary';

	type Page = 'encryption' | 'keyring' | 'remote-login' | 'secure-boot';

	interface Props {
		security: SecurityState;
		keyring: KeyringState;
		remote: RemoteLoginState;
		onopen: (page: Page) => void;
	}

	let { security, keyring, remote, onopen }: Props = $props();

	let summary = $derived(security.trust && summarize(security.trust, security.firmwareUpdates));
	let protections = $derived(Boolean(security.trust || security.host || security.firmwareUpdates || security.usb));

	function keyringSummary() {
		const current = keyring.current;
		if (current === null) return t('settings-passwords-not-running');
		if (!current) return undefined;
		return current.locked ? t('settings-passwords-locked') : protection(current);
	}
</script>

{#if summary}
	<HeroCard title={summary.headline} status={summary.sentence} icon={summary.safe ? ShieldCheck : ShieldAlert} good={summary.safe}>
		{#snippet actions()}
			{#if summary.secureBoot}
				<button type="button" class="button primary" onclick={() => onopen('secure-boot')}>{t('settings-protection-set-up')}</button>
			{/if}
		{/snippet}
	</HeroCard>
{/if}

{#if security.loaded}
	<Section>
		{#if security.trust?.disk.device}
			<ActionRow title={t('settings-encryption')} icon={HardDrive} description={encryptionSummary(security.trust.disk, security.trust.startup.withoutKey)} onclick={() => onopen('encryption')} />
		{/if}
		<ActionRow title={t('settings-passwords-title')} icon={KeyRound} description={keyringSummary()} onclick={() => onopen('keyring')} />
		{#if remote.current}
			<ActionRow title={t('settings-remote-login')} icon={TerminalSquare} description={remoteLoginSummary(remote.current)} onclick={() => onopen('remote-login')} />
		{/if}
	</Section>
	{#if protections}
		<ProtectionsSection {security} onsecureboot={() => onopen('secure-boot')} />
	{/if}
{/if}
