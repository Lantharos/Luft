<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes, Row, Section } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { Activity, Firmware } from '#lib/bindings.js';
	import { percent } from '#lib/format.js';

	let { devices, activity }: { devices: Firmware[]; activity: Activity } = $props();

	let error = $state<string | null>(null);

	async function install(device: Firmware) {
		error = null;
		await commands.updatesFirmwareInstall({ id: device.id }).catch((reason) => (error = String(reason)));
	}

	const busy = $derived(activity.running !== null);
</script>

<Section title={t('settings-updates-firmware')} description={t('settings-updates-firmware-description')}>
	{#each devices as device (device.id)}
		{@const installing = activity.running === 'firmware' && activity.target === device.id}
		<Row
			title={device.vendor ? `${device.vendor} ${device.name}` : device.name}
			description={[device.current ? `${device.current} → ${device.version}` : device.version, device.size ? bytes(device.size) : null, device.restart ? t('settings-updates-firmware-restart') : null]
				.filter(Boolean)
				.join(' · ')}
			truncate
		>
			{#if installing}
				<span>{activity.progress?.fraction != null ? percent(activity.progress.fraction) : t('settings-updates-firmware-installing')}</span>
			{:else}
				<button type="button" class="button" disabled={busy} onclick={() => install(device)}>{t('settings-updates-firmware-update')}</button>
			{/if}
		</Row>
	{/each}
	{#if error}
		<Row title={t('settings-updates-firmware-failed')} description={error} />
	{/if}
</Section>
