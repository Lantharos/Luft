<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes, Dialog } from '@luft/ui';
	import type { Drive, Volume } from '#lib/bindings.js';
	import { openFolder } from '#lib/bridge/index.js';
	import { filesystemName, folderName, inner, volumeName } from '#lib/format.js';
	import { explorable, typeName } from '#lib/partitions/types.js';
	import { disks } from '#lib/state/disks.svelte.js';
	import Facts from './Facts.svelte';
	import UsageLine from './UsageLine.svelte';

	interface Props {
		drive: Drive;
		volume: Volume;
		onclose: () => void;
	}

	let { drive, volume, onclose }: Props = $props();

	let contents = $derived(inner(volume));
	let mounted = $derived(contents.mountPoints.length > 0);
	let luft = $derived(disks.holdsLuft(volume));
	let mountedAt = $derived({ label: t('disks-details-mounted-at'), value: contents.mountPoints.map(folderName).join(', '), open: () => void openFolder(contents.mountPoints[0]) });
	let facts = $derived(
		[
			{ label: t('disks-details-format'), value: volume.encryption ? encryption() : filesystemName(volume) },
			{ label: t('disks-details-size'), value: bytes(volume.size) },
			luft && { label: t('disks-details-holds'), value: t('disks-details-holds-luft') },
			mounted && !luft && mountedAt,
			contents.startup && { label: t('disks-details-startup'), value: t('disks-details-startup-mounts', { folder: contents.startup.directory }) }
		].filter((fact) => fact !== false && fact !== null)
	);
	let technical = $derived(
		[
			{ label: t('disks-details-device'), value: volume.device, mono: true },
			volume.uuid && { label: t('disks-details-uuid'), value: volume.uuid, mono: true },
			contents !== volume && contents.uuid && { label: t('disks-details-contents-uuid'), value: contents.uuid, mono: true },
			volume.partitionType && { label: t('disks-details-partition-type'), value: typeName(volume.partitionType) ?? '' },
			volume.partitionName && { label: t('disks-details-partition-name'), value: volume.partitionName },
			volume.number !== null && { label: t('disks-details-partition'), value: t('disks-details-partition-number', { number: volume.number, device: drive.device }) },
			luft && mountedAt
		].filter((fact) => fact !== false && fact !== '' && fact !== null)
	);
	let more = $state(false);

	function encryption() {
		return volume.encryption?.cleartext ? t('disks-details-encrypted', { filesystem: filesystemName(contents) }) : t('disks-details-locked');
	}

	function explore() {
		disks.exploreVolume(volume);
		onclose();
	}
</script>

<Dialog title={volumeName(volume)} wide {onclose}>
	{#if contents.used !== null}
		<UsageLine used={contents.used} size={volume.size} />
	{/if}
	<Facts {facts} />
	{#snippet actions()}
		<button type="button" class="button mr-auto" onclick={() => (more = true)}>{t('disks-details-technical')}</button>
		{#if explorable(volume)}
			<button type="button" class="button" onclick={explore}>{t('disks-explore')}</button>
		{/if}
		<button type="button" class="button primary" onclick={onclose}>{t('disks-done')}</button>
	{/snippet}
</Dialog>

{#if more}
	<Dialog title={t('disks-details-technical-title', { name: volumeName(volume) })} wide onclose={() => (more = false)}>
		<Facts facts={technical} />
		{#snippet actions()}
			<button type="button" class="button primary" onclick={() => (more = false)}>{t('disks-done')}</button>
		{/snippet}
	</Dialog>
{/if}

