<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, errorText } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { Drive, Outcome, Volume } from '#lib/bindings.js';
	import { CANCELLED, WAIT } from '#lib/bridge/index.js';
	import { changing, KeyRequest, progressSentence } from '#lib/encryption.svelte.js';
	import { volumeName } from '#lib/format.js';
	import { disks } from '#lib/state/disks.svelte.js';
	import { dialogs } from '../dialogs.svelte';
	import KeyPrompt from './KeyPrompt.svelte';
	import Line from './Line.svelte';
	import SwitchLine from './SwitchLine.svelte';

	interface Props {
		drive: Drive;
		volume: Volume;
		onclose: () => void;
	}

	let { drive, volume, onclose }: Props = $props();

	const request = new KeyRequest();

	let working = $state(false);
	let error = $state('');
	let remembered = $state(false);
	let pending = $state<((unlock: string) => Promise<Outcome<unknown>>) | null>(null);

	let name = $derived(volumeName(volume));
	let encryption = $derived(disks.encryption(volume));
	let busy = $derived(changing(encryption));
	let protection = $derived(disks.protection);
	let autoReason = $derived(!protection.available ? t('disks-encryption-unavailable') : protection.autoUnlock);
	let description = $derived(encryption && busy ? progressSentence(encryption) : undefined);
	let unlocksWhen = $derived(t('disks-encryption-auto-unlock.hint', { drive: drive.removable ? 'removable' : 'built-in' }));
	let title = $derived(
		encryption?.state === 'encrypting' || (busy && encryption?.change === 'encrypt')
			? t('disks-encryption-title-encrypting', { name })
			: busy
				? t('disks-encryption-title-decrypting', { name })
				: t('disks-encryption-title', { name })
	);

	$effect(() => {
		void commands.disksRemembered({ block: volume.block }).then((value) => (remembered = value));
	});

	async function attempt<T>(action: () => Promise<T>) {
		working = true;
		error = '';
		try {
			return await action();
		} catch (caught) {
			const message = errorText(caught);
			if (message !== CANCELLED) error = message;
			return false;
		} finally {
			working = false;
		}
	}

	async function keyed(action: (unlock: string) => Promise<Outcome<unknown>>) {
		pending = action;
		const done = await attempt(() => request.run(action));
		if (done) {
			pending = null;
			request.asking = false;
			request.key = '';
		}
		return done;
	}

	function setAutoUnlock(checked: boolean) {
		void keyed((unlock) => commands.trustUnlocking({ block: volume.block, unlock, recoveryKey: '', autoUnlock: checked }, WAIT));
	}

	async function showKey() {
		const key = await attempt(async () => {
			const shown = await commands.trustShowKey({ uuid: volume.uuid }, WAIT);
			dialogs.open({ kind: 'recovery-key', key: shown, name, fresh: false });
		});
		return key;
	}

	async function addKey() {
		const key = await commands.trustRecoveryKey().catch((caught) => (error = errorText(caught), ''));
		if (!key) return;
		if (await keyed((unlock) => commands.trustUnlocking({ block: volume.block, unlock, recoveryKey: key, autoUnlock: encryption?.autoUnlock ?? false }, WAIT))) dialogs.open({ kind: 'recovery-key', key, name, fresh: true });
	}

	function pause() {
		void attempt(() => commands.trustPause({ uuid: volume.uuid }, WAIT));
	}

	function resume() {
		void keyed((unlock) => commands.trustResume({ uuid: volume.uuid, unlock }, WAIT));
	}
</script>

<Dialog {title} {description} onclose={() => !working && onclose()}>
	<SwitchLine
		title={t('disks-encryption-auto-unlock')}
		hint={unlocksWhen}
		note={autoReason || undefined}
		checked={encryption?.autoUnlock ?? false}
		disabled={Boolean(autoReason) || busy || working}
		onchange={setAutoUnlock}
	/>
	{#if protection.available}
		<Line title={t('disks-encryption-recovery-key')} hint={t('disks-encryption-recovery-key.hint')}>
			{#if encryption?.recoveryKeyStored}
				<button type="button" class="button" disabled={working} onclick={showKey}>{t('disks-encryption-recovery-key-show')}</button>
			{:else}
				<button type="button" class="button" disabled={working || busy} onclick={addKey}>{t('disks-encryption-recovery-key-new')}</button>
			{/if}
		</Line>
	{/if}
	<Line title={t('disks-encryption-passphrase')} hint={t('disks-encryption-passphrase.hint')}>
		<button type="button" class="button" disabled={working || busy} onclick={() => dialogs.open({ kind: 'passphrase', volume })}>{t('disks-encryption-passphrase-change')}</button>
	</Line>
	{#if remembered}
		<Line title={t('disks-encryption-saved')} hint={t('disks-encryption-saved.hint')}>
			<button type="button" class="button" disabled={working} onclick={() => attempt(() => commands.disksForgetPassphrase({ block: volume.block }, WAIT).then(() => (remembered = false)))}>{t('disks-encryption-forget')}</button>
		</Line>
	{/if}
	{#if request.asking && pending}
		{@const action = pending}
		<KeyPrompt {request} onsubmit={() => keyed(action)} />
	{/if}
	{#if error}
		<p class="px-1 text-[13px] text-[var(--danger)]">{error}</p>
	{/if}
	{#snippet actions()}
		{#if protection.available && !busy && !drive.removable}
			<button type="button" class="button danger mr-auto" disabled={working} onclick={() => dialogs.open({ kind: 'turn-off', volume })}>{t('disks-encryption-turn-off-more')}</button>
		{/if}
		{#if encryption?.state === 'encrypting' || encryption?.state === 'decrypting'}
			<button type="button" class="button" disabled={working} onclick={pause}>{t('disks-action-pause')}</button>
		{:else if busy}
			<button type="button" class="button" disabled={working} onclick={resume}>{t('disks-action-resume')}</button>
		{/if}
		{#if request.asking && pending}
			{@const action = pending}
			<button type="button" class="button" disabled={working || !request.key} onclick={() => keyed(action)}>{t('disks-continue')}</button>
		{/if}
		<button type="button" class="button primary" disabled={working} onclick={onclose}>{t('disks-done')}</button>
	{/snippet}
</Dialog>
