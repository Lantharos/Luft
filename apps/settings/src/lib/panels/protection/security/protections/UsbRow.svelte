<script lang="ts">
	import Usb from '@lucide/svelte/icons/usb';
	import { Row, Switch } from '@luft/ui';
	import { problem, setUsbProtection, type UsbProtection } from '../api';
	import type { SecurityState } from '../state.svelte';

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

{#snippet failure()}
	<p class="pl-[34px] text-[12.5px] text-[var(--danger)]">{error}</p>
{/snippet}

<Row title="Hold back new USB devices" description="Ones plugged in while locked wait until you unlock" icon={Usb} below={error ? failure : undefined}>
	<Switch label="Hold back new USB devices" checked={usb.enabled} disabled={busy} onchange={change} />
</Row>
