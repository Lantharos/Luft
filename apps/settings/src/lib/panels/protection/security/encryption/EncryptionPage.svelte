<script lang="ts">
	import { t } from '@luft/i18n';
	import { Section } from '@luft/ui';
	import SubPage from '#lib/components/SubPage.svelte';
	import type { Trust } from '../api';
	import DrivesRow from './DrivesRow.svelte';
	import EncryptionRow from './EncryptionRow.svelte';
	import UnlockSection from './unlocking/UnlockSection.svelte';

	let { trust, onclose }: { trust: Trust; onclose: () => void } = $props();

	let disk = $derived(trust.disk);
</script>

<SubPage title={t('settings-encryption')} back={t('settings-page-security')} {onclose}>
	<Section>
		<EncryptionRow {disk} />
		{#if trust.drives.available}
			<DrivesRow drives={trust.drives} />
		{/if}
	</Section>

	{#if disk.encrypted}
		<UnlockSection {trust} />
	{/if}
</SubPage>
