<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, errorText, Row } from '@luft/ui';
	import type { UsbDevice, UsbProtection } from '#lib/bindings.js';
	import { allowUsbDevice, forgetUsbDevice } from '../api';

	let { usb, onclose }: { usb: UsbProtection; onclose: () => void } = $props();

	let busy = $state(false);
	let error = $state('');

	async function act(change: () => Promise<unknown>) {
		busy = true;
		error = '';
		try {
			await change();
		} catch (reason) {
			error = errorText(reason);
		}
		busy = false;
	}
</script>

{#snippet device(item: UsbDevice, label: string, named: string, run: (id: string) => Promise<unknown>)}
	<Row title={item.name} truncate>
		<button type="button" class="button" aria-label={t(named, { device: item.name })} disabled={busy} onclick={() => act(() => run(item.id))}>
			{t(label)}
		</button>
	</Row>
{/snippet}

<Dialog title={t('settings-usb-trusted')} description={t('settings-usb-trusted-hint')} onclose={onclose}>
	{#if usb.waiting.length}
		<div class="row-group">
			{#each usb.waiting as item (item.id)}
				{@render device(item, 'settings-usb-allow', 'settings-usb-allow-device', allowUsbDevice)}
			{/each}
		</div>
	{/if}
	<div class="row-group">
		{#each usb.trusted as item (item.id)}
			{@render device(item, 'settings-usb-forget', 'settings-usb-forget-device', forgetUsbDevice)}
		{:else}
			<Row title={t('settings-usb-trusted-none')} />
		{/each}
	</div>
	{#if error}
		<p class="text-[12.5px] text-[var(--danger)]">{error}</p>
	{/if}
	{#snippet actions()}
		<button type="button" class="button primary" onclick={onclose}>{t('settings-more-done')}</button>
	{/snippet}
</Dialog>
