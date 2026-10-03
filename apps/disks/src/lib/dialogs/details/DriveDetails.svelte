<script lang="ts">
	import { Dialog } from '@luft/ui';
	import type { Drive } from '$lib/api';
	import { bytes, driveKindName } from '$lib/format';
	import Facts from './Facts.svelte';

	interface Props {
		drive: Drive;
		onclose: () => void;
	}

	let { drive, onclose }: Props = $props();

	const TABLES = { gpt: 'GUID (GPT)', dos: 'Master Boot Record' };

	let facts = $derived(
		[
			{ label: 'Kind', value: driveKindName(drive) },
			{ label: 'Size', value: `${bytes(drive.size)} (${drive.size.toLocaleString()} bytes)` },
			drive.model && { label: 'Model', value: drive.model },
			drive.serial && { label: 'Serial number', value: drive.serial, mono: true },
			{ label: 'Device', value: drive.device, mono: true },
			{ label: 'Partition table', value: drive.table ? TABLES[drive.table] : 'None' },
			drive.readOnly && { label: 'Access', value: 'Read only' }
		].filter((fact) => fact !== false && fact !== '')
	);
</script>

<Dialog title={drive.name} wide {onclose}>
	<Facts {facts} />
	{#snippet actions()}
		<button type="button" class="button primary" onclick={onclose}>Done</button>
	{/snippet}
</Dialog>
