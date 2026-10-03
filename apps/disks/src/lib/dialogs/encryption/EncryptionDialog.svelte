<script lang="ts">
	import { Dialog } from '@luft/ui';
	import * as api from '#lib/api.js';
	import type { Drive, Volume } from '#lib/api.js';
	import { changing, KeyRequest, progressSentence } from '#lib/encryption.svelte.js';
	import { errorText, volumeName } from '#lib/format.js';
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
	let pending = $state<((unlock: string) => Promise<api.Outcome<unknown>>) | null>(null);

	let name = $derived(volumeName(volume));
	let encryption = $derived(disks.encryption(volume));
	let busy = $derived(changing(encryption));
	let protection = $derived(disks.protection);
	let autoReason = $derived(!protection.available ? 'Encrypting drives isn’t available on this computer.' : protection.autoUnlock);
	let description = $derived(
		encryption && busy
			? progressSentence(encryption)
			: encryption?.autoUnlock
				? 'It unlocks by itself on this computer, and with its passphrase or recovery key anywhere else.'
				: 'It asks for its passphrase or recovery key when it’s unlocked.'
	);
	let title = $derived(
		encryption?.state === 'encrypting' || (busy && encryption?.change === 'encrypt')
			? `Encrypting “${name}”`
			: busy
				? `Decrypting “${name}”`
				: `“${name}” is encrypted`
	);

	$effect(() => {
		void api.remembered(volume.block).then((value) => (remembered = value));
	});

	async function attempt(action: () => Promise<boolean | void>) {
		working = true;
		error = '';
		try {
			return await action();
		} catch (caught) {
			const message = errorText(caught);
			if (message !== api.CANCELLED) error = message;
			return false;
		} finally {
			working = false;
		}
	}

	async function keyed(action: (unlock: string) => Promise<api.Outcome<unknown>>) {
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
		void keyed((unlock) => api.trust.unlocking(volume.block, unlock, '', checked));
	}

	async function showKey() {
		const key = await attempt(async () => {
			const shown = await api.trust.showKey(volume.uuid);
			dialogs.open({ kind: 'recovery-key', key: shown, name });
		});
		return key;
	}

	async function addKey() {
		const key = await api.trust.recoveryKey().catch((caught) => (error = errorText(caught), ''));
		if (!key) return;
		if (await keyed((unlock) => api.trust.unlocking(volume.block, unlock, key, encryption?.autoUnlock ?? false))) dialogs.open({ kind: 'recovery-key', key, name });
	}

	function pause() {
		void attempt(() => api.trust.pause(volume.uuid));
	}

	function resume() {
		void keyed((unlock) => api.trust.resume(volume.uuid, unlock));
	}
</script>

<Dialog {title} {description} wide onclose={() => !working && onclose()}>
	<SwitchLine
		title="Unlock automatically on this computer"
		description={autoReason || (drive.removable ? 'When you plug it in, it opens without asking.' : 'When this computer starts, it opens without asking.')}
		checked={encryption?.autoUnlock ?? false}
		disabled={Boolean(autoReason) || busy || working}
		onchange={setAutoUnlock}
	/>
	{#if protection.available}
		<Line
			title="Recovery key"
			description={encryption?.recoveryKeyStored ? 'This computer keeps a copy, so you can see it again.' : 'Opens it when nothing else does.'}
		>
			{#if encryption?.recoveryKeyStored}
				<button type="button" class="button" disabled={working} onclick={showKey}>Show…</button>
			{:else}
				<button type="button" class="button" disabled={working || busy} onclick={addKey}>New key…</button>
			{/if}
		</Line>
	{/if}
	<Line title="Passphrase" description="What you type to unlock it here and on other computers.">
		<button type="button" class="button" disabled={working || busy} onclick={() => dialogs.open({ kind: 'passphrase', volume })}>Change…</button>
	</Line>
	{#if remembered}
		<Line title="Saved in your keyring" description="So unlocking it here needs no typing.">
			<button type="button" class="button" disabled={working} onclick={() => attempt(() => api.forgetPassphrase(volume.block).then(() => (remembered = false)))}>Forget</button>
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
			<button type="button" class="button danger mr-auto" disabled={working} onclick={() => dialogs.open({ kind: 'turn-off', volume })}>Turn off encryption…</button>
		{/if}
		{#if encryption?.state === 'encrypting' || encryption?.state === 'decrypting'}
			<button type="button" class="button" disabled={working} onclick={pause}>Pause</button>
		{:else if busy}
			<button type="button" class="button" disabled={working} onclick={resume}>Resume</button>
		{/if}
		{#if request.asking && pending}
			{@const action = pending}
			<button type="button" class="button" disabled={working || !request.key} onclick={() => keyed(action)}>Continue</button>
		{/if}
		<button type="button" class="button primary" disabled={working} onclick={onclose}>Done</button>
	{/snippet}
</Dialog>
