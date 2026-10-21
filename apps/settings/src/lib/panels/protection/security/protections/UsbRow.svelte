<script lang="ts">
	import Usb from '@lucide/svelte/icons/usb';
	import { t } from '@luft/i18n';
	import { errorText, Row, Switch } from '@luft/ui';
	import { setUsbProtection, type UsbProtection } from '../api';
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
			error = errorText(reason);
		}
		busy = false;
	}
</script>

{#snippet failure()}
	<p class="pl-[34px] text-[12.5px] text-[var(--danger)]">{error}</p>
{/snippet}

<Row title={t('settings-usb-hold-back')} description={t('settings-usb-hold-back-description')} icon={Usb} below={error ? failure : undefined}>
	<Switch label={t('settings-usb-hold-back')} checked={usb.enabled} disabled={busy} onchange={change} />
</Row>
