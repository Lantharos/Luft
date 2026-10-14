<script lang="ts">
	import Import from '@lucide/svelte/icons/import';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { onMount } from 'svelte';
	import { ActionRow, Section } from '@luft/ui';
	import { importFromWindows, pairedInWindows, type WindowsDevice } from './api';

	let devices = $state<WindowsDevice[]>([]);
	let importing = $state(false);
	let problem = $state('');

	let names = $derived(devices.map((device) => device.name ?? device.device));
	let summary = $derived(
		names.length <= 2 ? names.join(' and ') : `${names.slice(0, 2).join(', ')} and ${names.length - 2} more`
	);

	async function bring() {
		if (importing) return;
		importing = true;
		problem = '';
		try {
			await importFromWindows();
			devices = await pairedInWindows();
		} catch (reason) {
			problem = reason instanceof Error ? reason.message : String(reason);
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
			title="Bring your devices from Windows"
			description={problem || `${summary} ${devices.length === 1 ? 'is' : 'are'} paired in Windows. Use ${devices.length === 1 ? 'it' : 'them'} here without pairing again.`}
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
