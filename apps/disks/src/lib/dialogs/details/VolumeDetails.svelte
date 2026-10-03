<script lang="ts">
	import { Dialog } from '@luft/ui';
	import * as api from '#lib/api.js';
	import type { Drive, Volume } from '#lib/api.js';
	import { bytes, filesystemName, inner, partitionTypeName, volumeName } from '#lib/format.js';
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
	let facts = $derived(
		[
			{ label: 'Format', value: volume.encryption ? encryption() : filesystemName(volume) },
			{ label: 'Size', value: bytes(volume.size) },
			mounted && { label: 'Mounted at', value: contents.mountPoints.join(', '), open: () => void api.openFolder(contents.mountPoints[0]) },
			contents.startup && { label: 'At startup', value: `Mounts at ${contents.startup.directory}` },
			{ label: 'Device', value: volume.device, mono: true },
			volume.uuid && { label: 'UUID', value: volume.uuid, mono: true },
			contents !== volume && contents.uuid && { label: 'Contents UUID', value: contents.uuid, mono: true },
			partitionTypeName(volume) && { label: 'Partition type', value: partitionTypeName(volume) ?? '' },
			volume.number !== null && { label: 'Partition', value: `${volume.number} on ${drive.device}` }
		].filter((fact) => fact !== false && fact !== '' && fact !== null)
	);

	function encryption() {
		const kind = volume.encryption?.kind.toUpperCase();
		return volume.encryption?.cleartext ? `${filesystemName(contents)}, encrypted with ${kind}` : `Encrypted with ${kind}, locked`;
	}

	function explore() {
		onclose();
		disks.explore(contents.mountPoints[0], volumeName(volume));
	}
</script>

<Dialog title={volumeName(volume)} description="On {drive.name}" wide {onclose}>
	{#if contents.used !== null}
		<UsageLine used={contents.used} size={volume.size} />
	{/if}
	<Facts {facts} />
	{#snippet actions()}
		{#if mounted}
			<button type="button" class="button mr-auto" onclick={explore}>See what’s using space</button>
		{/if}
		<button type="button" class="button primary" onclick={onclose}>Done</button>
	{/snippet}
</Dialog>
