<script lang="ts">
	import { Dialog, Switch } from '@luft/ui';
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

<Dialog title={device.name} description={device.connected ? 'Connected' : 'Not connected'} {onclose}>
	<dl class="details">
		<dt>Type</dt>
		<dd>{KIND_LABELS[device.kind]}</dd>
		{#if device.battery !== null}
			<dt>Battery</dt>
			<dd>{device.battery}%</dd>
		{/if}
		<dt>Address</dt>
		<dd class="select-text">{device.address}</dd>
	</dl>
	<div class="flex items-center justify-between gap-4 pt-1">
		<div class="flex flex-col gap-0.5">
			<span class="text-[14px] font-medium">Connect automatically</span>
			<span class="text-[12.5px] text-[var(--text-muted)]">Let {device.name} connect whenever it’s nearby</span>
		</div>
		<Switch label="Connect automatically" checked={device.trusted} onchange={ontrust} />
	</div>
	{#snippet actions()}
		<button type="button" class="button danger mr-auto" onclick={onforget}>Forget</button>
		<button type="button" class="button" disabled={busy} onclick={ontoggle}>{device.connected ? 'Disconnect' : 'Connect'}</button>
		<button type="button" class="button primary" onclick={onclose}>Done</button>
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
