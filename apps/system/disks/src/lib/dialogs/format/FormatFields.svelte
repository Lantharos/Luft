<script lang="ts">
	import { t } from '@luft/i18n';
	import { Checkbox, PasswordField, Segmented, Select, Switch, TextField, tooltip } from '@luft/ui';
	import type { Filesystem, Format } from '#lib/bindings.js';
	import { filesystemLabel, LABEL_LIMITS } from '#lib/format.js';
	import { disks } from '#lib/state/disks.svelte.js';

	interface Props {
		format: Format;
		valid: boolean;
		offerErase: boolean;
	}

	let { format = $bindable(), valid = $bindable(), offerErase }: Props = $props();

	type Purpose = 'everywhere' | 'linux' | 'other';

	const HINTS: Record<Exclude<Purpose, 'other'>, string> = {
		everywhere: 'disks-format-hint-everywhere',
		linux: 'disks-format-hint-linux'
	};
	const OTHER: Filesystem[] = ['ext4', 'btrfs', 'exfat', 'ntfs', 'vfat'];
	const ENCRYPTABLE: Filesystem[] = ['ext4', 'btrfs'];

	let purpose = $state<Purpose>(format.filesystem === 'exfat' ? 'everywhere' : format.filesystem === 'ext4' ? 'linux' : 'other');
	let encrypt = $state(Boolean(format.passphrase));
	let passphrase = $state(format.passphrase ?? '');
	let confirm = $state(format.passphrase ?? '');

	let purposes = $derived<{ value: Purpose; label: string }[]>([
		{ value: 'everywhere', label: t('disks-format-purpose-everywhere') },
		{ value: 'linux', label: t('disks-format-purpose-linux') },
		{ value: 'other', label: t('disks-format-purpose-other') }
	]);
	let options = $derived(
		OTHER.map((filesystem) => {
			const support = disks.support(filesystem);
			const missing = support && !support.available;
			const name = filesystemLabel(filesystem);
			return { value: filesystem, label: missing ? (support.missing ? t('disks-format-needs', { filesystem: name, missing: support.missing }) : t('disks-format-needs-software', { filesystem: name })) : name };
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

<TextField label={t('disks-name')} showLabel placeholder={t('disks-untitled')} bind:value={format.label} error={format.label.length > limit ? t('disks-name-limit', { limit }) : ''} live />

<div class="flex flex-col gap-2">
	<Segmented label={t('disks-format-purpose')} options={purposes} value={purpose} onchange={choose} />
	{#if purpose === 'other'}
		<Select label={t('disks-format-filesystem')} {options} value={format.filesystem} onchange={(value) => (format.filesystem = value)} />
	{:else}
		<p class="px-1 text-[12.5px] text-[var(--text-muted)]">{t(HINTS[purpose])}</p>
	{/if}
</div>

{#if encryptable}
	<div class="flex items-center justify-between gap-4 px-1">
		<span class="text-[13px] font-medium" {@attach tooltip(t('disks-format-encrypt.tooltip'))}>{t('disks-format-encrypt')}</span>
		<Switch label={t('disks-format-encrypt')} checked={encrypt} onchange={(value) => (encrypt = value)} />
	</div>
	{#if encrypt}
		<PasswordField label={t('disks-passphrase')} bind:value={passphrase} autocomplete="new-password" />
		<PasswordField label={t('disks-passphrase-confirm')} bind:value={confirm} autocomplete="new-password" error={mismatch ? t('disks-passphrase-mismatch') : ''} live />
		<Checkbox label={t('disks-remember')} checked={format.remember} onchange={(value) => (format.remember = value)}>{t('disks-remember')}</Checkbox>
	{/if}
{/if}

{#if offerErase}
	<span class="self-start" {@attach tooltip(t('disks-format-overwrite.tooltip'))}>
		<Checkbox label={t('disks-format-overwrite')} checked={format.erase} onchange={(value) => (format.erase = value)}>{t('disks-format-overwrite')}</Checkbox>
	</span>
{/if}
