<script lang="ts">
	import { Row, Section, Switch } from '@luft/ui';
	import { problem, setUsbProtection, type UsbProtection } from './api';
	import type { SecurityState } from './state.svelte';

	let { security, usb }: { security: SecurityState; usb: UsbProtection } = $props();

	let busy = $state(false);
	let error = $state('');

	async function change(enabled: boolean) {
		busy = true;
		error = '';
		try {
			await setUsbProtection(enabled);
			security.usb = { ...usb, enabled };
		} catch (reason) {
			error = problem(reason);
		}
		busy = false;
	}
</script>

<Section title="USB devices">
	<Row title="Hold back new USB devices while locked" description="Devices plugged in while the screen is locked, or before anyone signs in, wait until you unlock">
		<Switch label="Hold back new USB devices while locked" checked={usb.enabled} disabled={busy} onchange={change} />
	</Row>
</Section>

{#if error}
	<p class="-mt-4 px-2 text-[13px] text-[var(--danger)]">{error}</p>
{/if}
