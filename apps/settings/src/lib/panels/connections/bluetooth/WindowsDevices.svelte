<script lang="ts">
	import Import from '@lucide/svelte/icons/import';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { onMount } from 'svelte';
	import { i18n, t } from '@luft/i18n';
	import { ActionRow, errorText, Section } from '@luft/ui';
	import { importFromWindows, pairedInWindows, type WindowsDevice } from './api';

	let devices = $state<WindowsDevice[]>([]);
	let importing = $state(false);
	let problem = $state('');

	let names = $derived(devices.map((device) => device.name ?? device.device));
	let list = $derived(new Intl.ListFormat(i18n.formats, { type: 'conjunction' }));
	let summary = $derived(
		list.format(names.length <= 2 ? names : [...names.slice(0, 2), t('settings-bluetooth-windows-more', { count: names.length - 2 })])
	);

	async function bring() {
		if (importing) return;
		importing = true;
		problem = '';
		try {
			await importFromWindows();
			devices = await pairedInWindows();
		} catch (reason) {
			problem = errorText(reason);
		} finally {
			importing = false;
		}
	}

	onMount(() => {
		pairedInWindows()
			.then((found) => (devices = found))
			.catch(() => (devices = []));
	});
</script>

{#if devices.length}
	<Section>
		<ActionRow
			title={t('settings-bluetooth-windows')}
			description={problem || t('settings-bluetooth-windows.description', { devices: summary, count: devices.length })}
			alert={Boolean(problem)}
			icon={Import}
			onclick={bring}
		>
			{#snippet trailing()}
				{#if importing}
					<LoaderCircle size={16} class="animate-spin" />
				{/if}
			{/snippet}
		</ActionRow>
	</Section>
{/if}
