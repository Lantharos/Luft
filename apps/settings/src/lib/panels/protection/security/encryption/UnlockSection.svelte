<script lang="ts">
	import { t } from '@luft/i18n';
	import { ConfirmDialog, Row, Section, Switch } from '@luft/ui';
	import { acceptSecureBootChange, problem, removeTpmUnlock, replaceRecoveryKey, setUpTpmUnlock, showRecoveryKey, type Trust } from '../api';
	import RecoveryKeyDialog from '../keys/RecoveryKeyDialog.svelte';
	import TpmDialog, { type TpmMode } from './TpmDialog.svelte';
	import { withUnlock } from './unlock.svelte';

	type Open = { kind: 'removeTpm' | 'removePin' | 'replaceKey' } | { kind: 'tpm'; mode: TpmMode } | { kind: 'key'; key: string; fresh: boolean; description?: string };

	let { trust }: { trust: Trust } = $props();

	let open = $state<Open | null>(null);
	let busy = $state(false);
	let error = $state('');

	let disk = $derived(trust.disk);
	let tpmUnlocks = $derived(disk.unlock.includes('tpm'));
	let pinSet = $derived(disk.unlock.includes('pin'));

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

	const close = () => (open = null);

	function closeTpm(recoveryKey?: string) {
		open = recoveryKey
			? { kind: 'key', key: recoveryKey, fresh: true, description: 'settings-encryption-new-key-description' }
			: null;
	}

	function relink() {
		if (pinSet) open = { kind: 'tpm', mode: 'relink' };
		else void attempt(() => withUnlock(setUpTpmUnlock('')).then((outcome) => outcome?.done && closeTpm(outcome.done)));
	}

	const showKey = () => attempt(async () => (open = { kind: 'key', key: await showRecoveryKey(), fresh: false }));

	async function replaceKey() {
		const outcome = await withUnlock(replaceRecoveryKey);
		if (outcome) open = { kind: 'key', key: outcome.done, fresh: true };
		return false;
	}
</script>

<Section title={t('settings-encryption-unlocking')}>
	{#if disk.secureBootChanged && tpmUnlocks}
		<Row title={t('settings-encryption-starts-differently')} description={t('settings-encryption-starts-differently-description')}>
			<button type="button" class="button" disabled={busy} onclick={() => attempt(acceptSecureBootChange)}>{t('settings-encryption-confirm')}</button>
		</Row>
	{:else if disk.tpmRefused && tpmUnlocks}
		<Row title={t('settings-encryption-asked-recovery-key')} description={t('settings-encryption-relink-description')}>
			<button type="button" class="button" disabled={busy} onclick={relink}>{t('settings-encryption-relink')}</button>
		</Row>
	{/if}

	{#if tpmUnlocks}
		<Row title={t('settings-encryption-chip-unlock')} description={t('settings-encryption-chip-unlock-on')}>
			<Switch label={t('settings-encryption-chip-unlock')} checked disabled={busy} onchange={() => (open = { kind: 'removeTpm' })} />
		</Row>
		{#if pinSet}
			<Row title={t('settings-encryption-pin')} description={t('settings-encryption-pin-description')}>
				<button type="button" class="button" onclick={() => (open = { kind: 'tpm', mode: 'change' })}>{t('settings-encryption-change')}</button>
				<button type="button" class="button" onclick={() => (open = { kind: 'removePin' })}>{t('settings-protection-remove')}</button>
			</Row>
		{:else}
			<Row title={t('settings-encryption-add-pin-row')} description={t('settings-encryption-add-pin-row-description')}>
				<button type="button" class="button" onclick={() => (open = { kind: 'tpm', mode: 'add' })}>{t('settings-encryption-add-pin')}</button>
			</Row>
		{/if}
	{:else if trust.tpm.usable}
		<Row title={t('settings-encryption-chip-unlock')} description={t('settings-encryption-chip-unlock-off')}>
			<button type="button" class="button" onclick={() => (open = { kind: 'tpm', mode: 'setup' })}>{t('settings-protection-set-up')}</button>
		</Row>
	{/if}

	<Row title={t('settings-recovery-title')} description={t('settings-recovery-description')}>
		{#if disk.recoveryKeyStored}
			<button type="button" class="button" disabled={busy} onclick={showKey}>{t('settings-recovery-show')}</button>
		{/if}
		<button type="button" class="button" disabled={busy} onclick={() => (open = { kind: 'replaceKey' })}>{t('settings-recovery-replace')}</button>
	</Row>
</Section>

{#if error}
	<p class="-mt-4 px-2 text-[13px] text-[var(--danger)]">{error}</p>
{/if}

{#if open?.kind === 'tpm'}
	<TpmDialog mode={open.mode} onclose={closeTpm} />
{:else if open?.kind === 'removeTpm'}
	<ConfirmDialog
		title={t('settings-encryption-stop-chip-title')}
		description={disk.unlock.includes('passphrase') ? t('settings-encryption-stop-chip-passphrase') : t('settings-encryption-stop-chip-recovery-key')}
		action={t('settings-encryption-stop-chip')}
		danger
		run={async () => Boolean(await withUnlock(removeTpmUnlock))}
		onclose={close}
	/>
{:else if open?.kind === 'removePin'}
	<ConfirmDialog
		title={t('settings-encryption-remove-pin-title')}
		description={t('settings-encryption-remove-pin-description')}
		action={t('settings-encryption-remove-pin')}
		run={async () => Boolean(await withUnlock(setUpTpmUnlock('')))}
		onclose={close}
	/>
{:else if open?.kind === 'replaceKey'}
	<ConfirmDialog
		title={t('settings-recovery-replace-title')}
		description={t('settings-recovery-replace-description')}
		action={t('settings-recovery-replace-key')}
		run={replaceKey}
		onclose={close}
	/>
{:else if open?.kind === 'key'}
	<RecoveryKeyDialog key={open.key} fresh={open.fresh} description={open.description && t(open.description)} onclose={close} />
{/if}
