<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes, Dialog } from '@luft/ui';
	import type { Drive } from '#lib/bindings.js';
	import { driveKindName } from '#lib/format.js';
	import Facts from './Facts.svelte';

	interface Props {
		drive: Drive;
		onclose: () => void;
	}

	let { drive, onclose }: Props = $props();

	let facts = $derived(
		[
			{ label: t('disks-details-kind'), value: driveKindName(drive) },
			{ label: t('disks-details-size'), value: t('disks-details-size-bytes', { size: bytes(drive.size), count: drive.size }) },
			drive.model && { label: t('disks-details-model'), value: drive.model },
			drive.serial && { label: t('disks-details-serial'), value: drive.serial, mono: true },
			{ label: t('disks-details-device'), value: drive.device, mono: true },
			{ label: t('disks-details-table'), value: t('disks-details-table-kind', { table: drive.table ?? 'none' }) },
			drive.readOnly && { label: t('disks-details-access'), value: t('disks-details-read-only') }
		].filter((fact) => fact !== false && fact !== '')
	);
</script>

<Dialog title={drive.name} wide {onclose}>
	<Facts {facts} />
	{#snippet actions()}
		<button type="button" class="button primary" onclick={onclose}>{t('disks-done')}</button>
	{/snippet}
</Dialog>
