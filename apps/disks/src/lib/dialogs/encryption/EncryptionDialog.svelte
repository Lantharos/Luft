<script lang="ts">
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
	let autoReason = $derived(!protection.available ? 'Encrypting drives isn’t available on this computer.' : protection.autoUnlock);
	let description = $derived(encryption && busy ? progressSentence(encryption) : undefined);
	let unlocksWhen = $derived(drive.removable ? 'Opens without asking when you plug it in' : 'Opens without asking when this computer starts');
	let title = $derived(
		encryption?.state === 'encrypting' || (busy && encryption?.change === 'encrypt')
			? `Encrypting “${name}”`
			: busy
				? `Decrypting “${name}”`
				: `“${name}” is encrypted`
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
			dialogs.open({ kind: 'recovery-key', key: shown, name });
		});
		return key;
	}

	async function addKey() {
		const key = await commands.trustRecoveryKey().catch((caught) => (error = errorText(caught), ''));
		if (!key) return;
		if (await keyed((unlock) => commands.trustUnlocking({ block: volume.block, unlock, recoveryKey: key, autoUnlock: encryption?.autoUnlock ?? false }, WAIT))) dialogs.open({ kind: 'recovery-key', key, name });
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
		title="Unlock automatically"
		hint={unlocksWhen}
		note={autoReason || undefined}
		checked={encryption?.autoUnlock ?? false}
		disabled={Boolean(autoReason) || busy || working}
		onchange={setAutoUnlock}
	/>
	{#if protection.available}
		<Line title="Recovery key" hint="Opens it when nothing else does">
			{#if encryption?.recoveryKeyStored}
				<button type="button" class="button" disabled={working} onclick={showKey}>Show…</button>
			{:else}
				<button type="button" class="button" disabled={working || busy} onclick={addKey}>New key…</button>
			{/if}
		</Line>
	{/if}
	<Line title="Passphrase" hint="Unlocks it here and on other computers">
		<button type="button" class="button" disabled={working || busy} onclick={() => dialogs.open({ kind: 'passphrase', volume })}>Change…</button>
	</Line>
	{#if remembered}
		<Line title="Saved in your keyring" hint="Unlocking it here needs no typing">
			<button type="button" class="button" disabled={working} onclick={() => attempt(() => commands.disksForgetPassphrase({ block: volume.block }, WAIT).then(() => (remembered = false)))}>Forget</button>
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
