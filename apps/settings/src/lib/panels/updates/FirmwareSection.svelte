<script lang="ts">
	import { Row, Section } from '@luft/ui';
	import { bytes } from '$lib/format';
	import type { Activity, Firmware } from './api';
	import { installFirmware } from './api';

	let { devices, activity }: { devices: Firmware[]; activity: Activity } = $props();

	let error = $state<string | null>(null);

	async function install(device: Firmware) {
		error = null;
		await installFirmware(device.id).catch((reason) => (error = String(reason)));
	}

	const busy = $derived(activity.running !== null);
</script>

<Section title="Firmware" description="Updates for the software built into your hardware">
	{#each devices as device (device.id)}
		{@const installing = activity.running === 'firmware' && activity.target === device.id}
		<Row
			title={device.vendor ? `${device.vendor} ${device.name}` : device.name}
			description={[device.current ? `${device.current} → ${device.version}` : device.version, device.size ? bytes(device.size) : null, device.restart ? 'Finishes when you restart' : null]
				.filter(Boolean)
				.join(' · ')}
		>
			{#if installing}
				<span>{activity.progress?.fraction != null ? `${Math.round(activity.progress.fraction * 100)}%` : 'Installing…'}</span>
			{:else}
				<button type="button" class="button" disabled={busy} onclick={() => install(device)}>Update</button>
			{/if}
		</Row>
	{/each}
	{#if error}
		<Row title="The firmware couldn't be updated" description={error} />
	{/if}
</Section>
