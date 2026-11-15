<script lang="ts">
	import { t } from '@luft/i18n';
	import { untrack } from 'svelte';
	import { EncryptionWizard, errorText, PassphraseFields } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { Drive, DriveCheck, Volume } from '#lib/bindings.js';
	import { CANCELLED, WAIT } from '#lib/bridge/index.js';
	import { SHORTEST_PASSPHRASE } from '#lib/encryption.svelte.js';
	import { volumeName } from '#lib/format.js';
	import SwitchLine from './SwitchLine.svelte';

	interface Props {
		drive: Drive;
		volume: Volume;
		onclose: () => void;
	}

	let { drive, volume, onclose }: Props = $props();

	const EXT4_LABEL = 16;

	let plan = $state.raw<DriveCheck | null>(null);
	let auto = $state(false);
	let usePassphrase = $state(untrack(() => drive.removable));
	let passphrase = $state('');
	let confirmation = $state('');

	let name = $derived(volumeName(volume));
	let reformat = $derived(plan?.method === 'reformat');
	let blocked = $derived(plan?.method === 'none' || (plan?.method === 'in-place' && plan.checks.some((item) => !item.passed)));
	let autoAvailable = $derived(plan !== null && !plan.autoUnlock);
	let passphraseReady = $derived(passphrase.length >= SHORTEST_PASSPHRASE && passphrase === confirmation);
	let unlockReady = $derived(usePassphrase ? passphraseReady : auto);

	let titles = $derived({
		check: blocked ? t('disks-encrypt-blocked', { name }) : reformat ? t('disks-encrypt-reformat', { name }) : t('disks-encrypt-title', { name }),
		key: t('disks-encrypt-key'),
		unlock: t('disks-encrypt-unlock'),
		summary: reformat ? t('disks-encrypt-ready-reformat') : t('disks-encrypt-ready')
	});

	let descriptions = $derived({
		check: blocked ? undefined : reformat ? t('disks-encrypt-reformat-description') : t('disks-encrypt-description'),
		key: t('disks-encrypt-key-description')
	});

	let summary = $derived(
		(reformat
			? [
					t('disks-encrypt-summary-erased', { name }),
					t('disks-encrypt-summary-formatted'),
					auto ? t('disks-encrypt-summary-auto', { drive: drive.removable ? 'removable' : 'built-in' }) : ''
				]
			: [
					t('disks-encrypt-summary-background'),
					usePassphrase ? t('disks-encrypt-summary-until-done') : '',
					t('disks-encrypt-summary-keep-on', { drive: drive.removable ? 'removable' : 'built-in' })
				]
		).filter(Boolean)
	);

	async function check() {
		plan = await commands.trustCheck({ block: volume.block }, WAIT);
		auto = !plan.autoUnlock && !drive.removable;
		return plan.checks;
	}

	async function encrypt(key: string) {
		const secret = usePassphrase ? passphrase : '';
		if (!reformat) {
			await commands.trustEncrypt({ block: volume.block, recoveryKey: key, passphrase: secret, autoUnlock: auto }, WAIT);
			return;
		}
		const label = (volume.label || name).slice(0, EXT4_LABEL);
		await commands.trustFormat({ block: volume.block, format: { filesystem: 'ext4', label, passphrase: secret || null, remember: false, erase: false }, recoveryKey: key, autoUnlock: auto }, WAIT);
	}

	function explain(caught: unknown) {
		const message = errorText(caught);
		return message === CANCELLED ? '' : message;
	}
</script>

<EncryptionWizard
	{titles}
	{descriptions}
	{check}
	{blocked}
	recoveryKey={commands.trustRecoveryKey}
	onsave={(key) => commands.trustSaveKey({ key, name }, WAIT)}
	onprint={(key) => commands.trustPrintKey({ key, name }, WAIT)}
	{unlockReady}
	{summary}
	finish={reformat ? t('disks-encrypt-finish-reformat') : t('disks-encrypt-finish')}
	finishing={t('disks-encrypt-starting')}
	danger={reformat}
	onfinish={encrypt}
	{explain}
	{onclose}
>
	{#snippet unlock(next)}
		<SwitchLine
			title={t('disks-encryption-auto-unlock')}
			hint={t('disks-encryption-auto-unlock.hint', { drive: drive.removable ? 'removable' : 'built-in' })}
			note={autoAvailable ? undefined : (plan?.autoUnlock ?? '')}
			checked={auto && autoAvailable}
			disabled={!autoAvailable}
			onchange={(checked) => (auto = checked)}
		/>
		<SwitchLine
			title={t('disks-encrypt-use-passphrase')}
			hint={t('disks-encrypt-use-passphrase.hint', { drive: drive.removable ? 'removable' : 'built-in' })}
			checked={usePassphrase}
			onchange={(checked) => (usePassphrase = checked)}
		/>
		{#if usePassphrase}
			<PassphraseFields bind:passphrase bind:confirmation minimum={SHORTEST_PASSPHRASE} onsubmit={next} />
		{:else if !auto}
			<p class="px-1 text-[12.5px] text-[var(--text-muted)]">{t('disks-encrypt-choose')}</p>
		{/if}
	{/snippet}
</EncryptionWizard>
