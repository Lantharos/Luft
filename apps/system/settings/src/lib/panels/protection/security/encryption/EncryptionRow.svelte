<script lang="ts">
	import LockKeyhole from '@lucide/svelte/icons/lock-keyhole';
	import { t } from '@luft/i18n';
	import { errorText, Row } from '@luft/ui';
	import type { Disk } from '#lib/bindings.js';
	import { cancelEncryption, restart } from '../api';
	import { encryptionSummary } from './describe';
	import TurnOnDialog from './TurnOnDialog.svelte';

	let { disk }: { disk: Disk } = $props();

	let turningOn = $state(false);
	let busy = $state(false);
	let error = $state('');

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

<Row title={t('settings-encryption')} description={encryptionSummary(disk)} icon={LockKeyhole}>
	{#if disk.encrypting === 'after-restart'}
		<button type="button" class="button" disabled={busy} onclick={() => attempt(cancelEncryption)}>{t('settings-encryption-dont-encrypt')}</button>
		<button type="button" class="button primary" disabled={busy} onclick={() => attempt(restart)}>{t('settings-protection-restart')}</button>
	{:else if disk.encrypting === 'no' && !disk.encrypted && disk.canEncrypt}
		<button type="button" class="button" onclick={() => (turningOn = true)}>{t('settings-encryption-turn-on')}</button>
	{/if}
</Row>

{#if error}
	<p class="px-2 text-[13px] text-[var(--danger)]">{error}</p>
{/if}

{#if turningOn}
	<TurnOnDialog {disk} onclose={() => (turningOn = false)} />
{/if}
