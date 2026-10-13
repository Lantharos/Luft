<script lang="ts">
	import LockKeyhole from '@lucide/svelte/icons/lock-keyhole';
	import { Checkbox, PasswordField, RecoveryKey } from '@luft/ui';
	import { encrypt, encryptionChecks, printKey, recoveryKey, saveKey, type Check } from '#lib/api/system.js';
	import StepFrame from '#lib/components/StepFrame.svelte';
	import { flow } from '#lib/state/flow.svelte.js';
	import { setup } from '#lib/state/setup.svelte.js';

	let key = $state('');
	let kept = $state(false);
	let passphrase = $state('');
	let repeated = $state('');
	let failing = $state<Check[]>([]);
	let busy = $state(false);
	let problem = $state('');

	let tpm = $derived(setup.trust?.tpm ?? false);
	let ready = $derived(kept && (tpm || (passphrase.length > 0 && passphrase === repeated)));

	async function attempt(action: () => Promise<void>) {
		busy = true;
		problem = '';
		try {
			await action();
		} catch (error) {
			problem = String(error);
		} finally {
			busy = false;
		}
	}

	const prepare = () =>
		attempt(async () => {
			failing = (await encryptionChecks()).filter((check) => !check.passed);
			if (!failing.length) key = await recoveryKey();
		});

	const turnOn = () =>
		attempt(async () => {
			await encrypt(key, tpm ? '' : passphrase);
			setup.needsRestart = true;
			flow.next();
		});
</script>

<StepFrame
	title="Protect your files"
	description={tpm
		? 'Encrypt this computer so nobody can read your files without signing in, even if it’s lost. It unlocks by itself when it starts.'
		: 'Encrypt this computer so nobody can read your files without your passphrase, even if it’s lost.'}
>
	{#if failing.length}
		<ul class="flex max-w-[560px] flex-col gap-2 text-[14px] leading-relaxed">
			{#each failing as check (check.id)}
				<li>{check.sentence}</li>
			{/each}
		</ul>
	{:else if key}
		<div class="flex max-w-[560px] flex-col gap-5">
			<p class="text-[14px] leading-relaxed text-[var(--text-soft)]">
				Keep this recovery key somewhere safe, away from this computer. You need it if the computer ever can’t unlock by itself.
			</p>
			<RecoveryKey {key} onsave={() => saveKey(key)} onprint={() => printKey(key)} />
			{#if !tpm}
				<div class="grid grid-cols-2 gap-3">
					<PasswordField bind:value={passphrase} label="Passphrase" showLabel autocomplete="new-password" />
					<PasswordField bind:value={repeated} label="Type it again" showLabel autocomplete="new-password" error={repeated && repeated !== passphrase ? 'They don’t match' : ''} live />
				</div>
			{/if}
			<Checkbox checked={kept} label="I’ve kept my recovery key" onchange={(checked) => (kept = checked)}>I’ve kept my recovery key</Checkbox>
		</div>
	{:else}
		<div class="flex items-center gap-4 text-[14px] leading-relaxed text-[var(--text-soft)]">
			<span class="grid h-14 w-14 flex-none place-items-center rounded-[18px] bg-[var(--accent-soft)] text-[var(--accent)]"><LockKeyhole size={26} /></span>
			<p class="max-w-[480px]">Encrypting happens in the background after the next restart, and you can keep using your computer meanwhile.</p>
		</div>
	{/if}
	{#if problem}
		<p class="mt-4 text-[13.5px] text-[var(--danger)]">{problem}</p>
	{/if}
	{#snippet actions()}
		<button type="button" class="plain-button large" onclick={() => flow.next()}>Not now</button>
		{#if key}
			<button type="button" class="button primary large px-6" disabled={!ready || busy} onclick={turnOn}>Encrypt</button>
		{:else if !failing.length}
			<button type="button" class="button primary large px-6" disabled={busy} onclick={prepare}>{busy ? 'Checking…' : 'Encrypt my files'}</button>
		{/if}
	{/snippet}
</StepFrame>
