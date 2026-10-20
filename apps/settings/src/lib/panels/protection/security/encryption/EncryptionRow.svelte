<script lang="ts">
	import LockKeyhole from '@lucide/svelte/icons/lock-keyhole';
	import { t } from '@luft/i18n';
	import { Row, Switch } from '@luft/ui';
	import { problem, restart, type Disk, type Tpm } from '../api';
	import { progressLine, unlockSummary } from './describe';
	import TurnOffDialog from './TurnOffDialog.svelte';
	import TurnOnDialog from './TurnOnDialog.svelte';

	let { disk, tpm }: { disk: Disk; tpm: Tpm } = $props();

	let open = $state<'on' | 'off' | null>(null);
	let busy = $state(false);
	let error = $state('');

	async function restartNow() {
		busy = true;
		error = '';
		try {
			await restart();
		} catch (reason) {
			error = problem(reason);
		}
		busy = false;
	}
</script>

{#snippet progress()}
	<div class="h-1.5 overflow-hidden rounded-full bg-[var(--control)]">
		<div class="progress-fill h-full rounded-full bg-[var(--accent)]" style:--progress={disk.progress}></div>
	</div>
{/snippet}

{#snippet failure()}
	<p class="pl-[34px] text-[12.5px] text-[var(--danger)]">{error}</p>
{/snippet}

{#if disk.state === 'encrypting'}
	<Row title={t('settings-encryption-encrypting')} description={progressLine(disk)} icon={LockKeyhole} below={progress} />
{:else if disk.state === 'decrypting'}
	<Row title={t('settings-encryption-decrypting')} description={progressLine(disk)} icon={LockKeyhole} below={progress} />
{:else if disk.state === 'starting'}
	<Row title={t('settings-encryption')} description={t('settings-encryption-starting')} icon={LockKeyhole} below={error ? failure : undefined}>
		<button type="button" class="button primary" disabled={busy} onclick={restartNow}>{t('settings-protection-restart')}</button>
	</Row>
{:else if disk.state === 'on'}
	<Row title={t('settings-encryption')} description={unlockSummary(disk)} icon={LockKeyhole}>
		<Switch label={t('settings-encryption')} checked onchange={() => (open = 'off')} />
	</Row>
{:else if disk.device}
	<Row
		title={t('settings-encryption')}
		description={disk.state === 'failed' ? t('settings-encryption-failed') : t('settings-encryption-off')}
		icon={LockKeyhole}
	>
		<button type="button" class="button" onclick={() => (open = 'on')}>{t('settings-protection-turn-on')}</button>
	</Row>
{/if}

{#if open === 'on'}
	<TurnOnDialog {tpm} onclose={() => (open = null)} />
{:else if open === 'off'}
	<TurnOffDialog onclose={() => (open = null)} />
{/if}
