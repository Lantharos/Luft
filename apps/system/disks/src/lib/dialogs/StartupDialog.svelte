<script lang="ts">
	import { t } from '@luft/i18n';
	import { untrack } from 'svelte';
	import { Dialog, Switch, TextField } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { Volume } from '#lib/bindings.js';
	import { WAIT } from '#lib/bridge/index.js';
	import { volumeName } from '#lib/format.js';
	import { disks } from '#lib/state/disks.svelte.js';

	interface Props {
		volume: Volume;
		onclose: () => void;
	}

	let { volume, onclose }: Props = $props();

	let enabled = $state(untrack(() => Boolean(volume.startup)));
	let directory = $state(untrack(() => volume.startup?.directory ?? `/mnt/${(volume.label || volume.uuid).replace(/[^\w.-]+/g, '-')}`));
	let readOnly = $state(untrack(() => volume.startup?.options.split(',').includes('ro') ?? false));
	let valid = $derived(!enabled || /^\/[^\s]+$/.test(directory));

	async function submit() {
		if (valid && (await disks.run(volume.block, () => commands.disksStartup({ block: volume.block, directory: enabled ? directory : null, readOnly }, WAIT)))) onclose();
	}
</script>

{#snippet row(title: string, checked: boolean, change: (value: boolean) => void)}
	<div class="flex items-center justify-between gap-4 px-1">
		<span class="text-[13px] font-medium">{title}</span>
		<Switch label={title} {checked} onchange={change} />
	</div>
{/snippet}

<Dialog title={t('disks-startup-title', { name: volumeName(volume) })} {onclose}>
	{@render row(t('disks-startup-enabled'), enabled, (value) => (enabled = value))}
	{#if enabled}
		<TextField label={t('disks-startup-folder')} showLabel bind:value={directory} error={valid ? '' : t('disks-startup-folder-invalid')} live />
		{@render row(t('disks-startup-read-only'), readOnly, (value) => (readOnly = value))}
	{/if}
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>{t('disks-cancel')}</button>
		<button type="button" class="button primary" disabled={!valid} onclick={submit}>{t('disks-save')}</button>
	{/snippet}
</Dialog>
