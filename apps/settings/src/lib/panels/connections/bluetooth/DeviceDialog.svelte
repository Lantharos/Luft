<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, Switch } from '@luft/ui';
	import { percent } from '#lib/format.js';
	import type { Device } from './api';
	import { KIND_LABELS } from './kinds';

	interface Props {
		device: Device;
		busy: boolean;
		ontrust: (trusted: boolean) => void;
		ontoggle: () => void;
		onforget: () => void;
		onclose: () => void;
	}

	let { device, busy, ontrust, ontoggle, onforget, onclose }: Props = $props();
</script>

<Dialog title={device.name} description={device.connected ? t('settings-bluetooth-connected') : undefined} {onclose}>
	<dl class="details">
		<dt>{t('settings-bluetooth-type')}</dt>
		<dd>{t(KIND_LABELS[device.kind])}</dd>
		{#if device.battery !== null}
			<dt>{t('settings-bluetooth-battery')}</dt>
			<dd>{percent(device.battery / 100)}</dd>
		{/if}
		<dt>{t('settings-bluetooth-address')}</dt>
		<dd class="select-text">{device.address}</dd>
	</dl>
	<div class="flex items-center justify-between gap-4 pt-1">
		<div class="flex min-w-0 flex-col gap-0.5">
			<span class="text-[14px] font-medium">{t('settings-bluetooth-autoconnect')}</span>
			<span class="text-[12.5px] text-[var(--text-muted)]">{t('settings-bluetooth-autoconnect.description')}</span>
		</div>
		<Switch label={t('settings-bluetooth-autoconnect')} checked={device.trusted} onchange={ontrust} />
	</div>
	{#snippet actions()}
		<button type="button" class="button danger mr-auto" onclick={onforget}>{t('settings-bluetooth-forget')}</button>
		<button type="button" class="button" disabled={busy} onclick={ontoggle}>{device.connected ? t('settings-bluetooth-disconnect') : t('settings-bluetooth-connect')}</button>
		<button type="button" class="button primary" onclick={onclose}>{t('settings-bluetooth-done')}</button>
	{/snippet}
</Dialog>

<style>
	.details {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: 10px 20px;
		font-size: 13px;
	}

	dt {
		color: var(--text-muted);
	}

	dd {
		overflow-wrap: anywhere;
		text-align: right;
		color: var(--text);
	}
</style>
