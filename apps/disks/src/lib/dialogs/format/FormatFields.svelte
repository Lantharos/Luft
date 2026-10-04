<script lang="ts">
	import { Checkbox, PasswordField, Segmented, Select, Switch, TextField, tooltip } from '@luft/ui';
	import type { Filesystem, Format } from '#lib/api.js';
	import { FILESYSTEM_NAMES, LABEL_LIMITS } from '#lib/format.js';
	import { disks } from '#lib/state/disks.svelte.js';

	interface Props {
		format: Format;
		valid: boolean;
		offerErase: boolean;
	}

	let { format = $bindable(), valid = $bindable(), offerErase }: Props = $props();

	type Purpose = 'everywhere' | 'linux' | 'other';

	const PURPOSES: { value: Purpose; label: string }[] = [
		{ value: 'everywhere', label: 'All computers' },
		{ value: 'linux', label: 'Linux only' },
		{ value: 'other', label: 'Other' }
	];
	const HINTS: Record<Exclude<Purpose, 'other'>, string> = {
		everywhere: 'exFAT · Windows, Mac, Linux, cameras and TVs',
		linux: 'ext4 · Fastest on Linux, can be encrypted'
	};
	const OTHER: Filesystem[] = ['ext4', 'btrfs', 'exfat', 'ntfs', 'vfat'];
	const ENCRYPTABLE: Filesystem[] = ['ext4', 'btrfs'];

	let purpose = $state<Purpose>(format.filesystem === 'exfat' ? 'everywhere' : format.filesystem === 'ext4' ? 'linux' : 'other');
	let encrypt = $state(Boolean(format.passphrase));
	let passphrase = $state(format.passphrase ?? '');
	let confirm = $state(format.passphrase ?? '');

	let options = $derived(
		OTHER.map((filesystem) => {
			const support = disks.support(filesystem);
			const missing = support && !support.available;
			return { value: filesystem, label: missing ? `${FILESYSTEM_NAMES[filesystem]} (needs ${support.missing || 'extra software'})` : FILESYSTEM_NAMES[filesystem] };
		})
	);
	let encryptable = $derived(ENCRYPTABLE.includes(format.filesystem));
	let limit = $derived(LABEL_LIMITS[format.filesystem]);
	let mismatch = $derived(encrypt && confirm.length > 0 && passphrase !== confirm);

	$effect(() => {
		format.passphrase = encrypt && encryptable ? passphrase : null;
	});

	$effect(() => {
		const available = disks.support(format.filesystem)?.available ?? true;
		valid = available && format.label.length <= limit && (!encrypt || !encryptable || (passphrase.length > 0 && passphrase === confirm));
	});

	function choose(next: Purpose) {
		purpose = next;
		if (next === 'everywhere') format.filesystem = 'exfat';
		if (next === 'linux') format.filesystem = 'ext4';
	}
</script>

<TextField label="Name" showLabel placeholder="Untitled" bind:value={format.label} error={format.label.length > limit ? `Up to ${limit} characters for this format` : ''} live />

<div class="flex flex-col gap-2">
	<Segmented label="Use with" options={PURPOSES} value={purpose} onchange={choose} />
	{#if purpose === 'other'}
		<Select label="Format" {options} value={format.filesystem} onchange={(value) => (format.filesystem = value)} />
	{:else}
		<p class="px-1 text-[12.5px] text-[var(--text-muted)]">{HINTS[purpose]}</p>
	{/if}
</div>

{#if encryptable}
	<div class="flex items-center justify-between gap-4 px-1">
		<span class="text-[13px] font-medium" {@attach tooltip('Nobody can read it without the passphrase')}>Encrypt with a passphrase</span>
		<Switch label="Encrypt with a passphrase" checked={encrypt} onchange={(value) => (encrypt = value)} />
	</div>
	{#if encrypt}
		<PasswordField label="Passphrase" bind:value={passphrase} autocomplete="new-password" />
		<PasswordField label="Confirm passphrase" bind:value={confirm} autocomplete="new-password" error={mismatch ? 'The passphrases don’t match' : ''} live />
		<Checkbox label="Remember in my keyring" checked={format.remember} onchange={(value) => (format.remember = value)}>Remember in my keyring</Checkbox>
	{/if}
{/if}

{#if offerErase}
	<span class="self-start" {@attach tooltip('So it can’t be recovered. Takes much longer.')}>
		<Checkbox label="Overwrite old data" checked={format.erase} onchange={(value) => (format.erase = value)}>Overwrite old data</Checkbox>
	</span>
{/if}
