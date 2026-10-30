<script lang="ts">
	import HardDrive from '@lucide/svelte/icons/hard-drive';
	import KeyRound from '@lucide/svelte/icons/key-round';
	import ShieldAlert from '@lucide/svelte/icons/shield-alert';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import ShieldEllipsis from '@lucide/svelte/icons/shield-ellipsis';
	import { t } from '@luft/i18n';
	import { ActionRow, Section } from '@luft/ui';
	import { encryptionSummary } from './encryption/describe';
	import { protection } from './keyring/describe';
	import type { KeyringState } from './keyring/state.svelte';
	import { levelSentence } from './protections/hsi';
	import type { SecurityState } from './state.svelte';
	import { summarize } from './summary';

	type Page = 'protections' | 'encryption' | 'keyring';

	interface Props {
		security: SecurityState;
		keyring: KeyringState;
		onopen: (page: Page) => void;
	}

	let { security, keyring, onopen }: Props = $props();

	let summary = $derived(security.trust && summarize(security.trust, security.firmwareUpdates));
	let protections = $derived(Boolean(security.trust || security.host || security.firmwareUpdates || security.usb));

	function protectionsSummary() {
		if (security.host) return levelSentence(security.host);
		return security.trust?.secureBoot === 'on' ? t('settings-security-secure-boot-description') : undefined;
	}

	function keyringSummary() {
		const current = keyring.current;
		if (current === null) return t('settings-passwords-not-running');
		if (!current) return undefined;
		return current.locked ? t('settings-passwords-locked') : protection(current);
	}
</script>

{#if summary}
	{@const Icon = summary.safe ? ShieldCheck : ShieldAlert}
	<div class="flex items-center gap-4 px-2 pb-1">
		<span class="plate" class:safe={summary.safe}><Icon size={26} strokeWidth={1.75} /></span>
		<div class="flex min-w-0 flex-1 flex-col gap-1">
			<span class="truncate text-[26px] font-semibold">{summary.headline}</span>
			<span class="truncate text-[14px] text-[var(--text-muted)]">{summary.sentence}</span>
		</div>
	</div>
{/if}

{#if security.loaded}
	<Section>
		{#if security.trust?.disk.device}
			<ActionRow title={t('settings-encryption')} icon={HardDrive} description={encryptionSummary(security.trust.disk)} onclick={() => onopen('encryption')} />
		{/if}
		<ActionRow title={t('settings-passwords-title')} icon={KeyRound} description={keyringSummary()} onclick={() => onopen('keyring')} />
		{#if protections}
			<ActionRow title={t('settings-page-protections')} icon={ShieldEllipsis} description={protectionsSummary()} onclick={() => onopen('protections')} />
		{/if}
	</Section>
{/if}

<style>
	.plate {
		display: grid;
		height: 56px;
		width: 56px;
		flex: none;
		place-items: center;
		border-radius: var(--radius-pill);
		background: var(--surface);
		color: var(--text-soft);
	}

	.plate.safe {
		color: var(--success);
	}
</style>
