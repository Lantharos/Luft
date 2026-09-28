<script lang="ts">
	import BluetoothIcon from '@lucide/svelte/icons/bluetooth';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import Trash from '@lucide/svelte/icons/trash';
	import { onMount } from 'svelte';
	import Dialog from '$lib/components/controls/Dialog.svelte';
	import Row from '$lib/components/controls/Row.svelte';
	import Section from '$lib/components/controls/Section.svelte';
	import Switch from '$lib/components/controls/Switch.svelte';
	import ActionRow from '$lib/components/controls/ActionRow.svelte';
	import IconButton from '$lib/components/controls/IconButton.svelte';
	import RequestDialog from './RequestDialog.svelte';
	import {
		close,
		connect,
		disconnect,
		forget,
		onCancel,
		onChanged,
		onRequest,
		open,
		pair,
		setPowered,
		type Adapter,
		type Bluetooth,
		type Device,
		type PairingRequest
	} from './api';
	import { KIND_ICONS } from './kinds';

	type Busy = 'connecting' | 'disconnecting' | 'pairing';

	const BUSY_LABELS: Record<Busy, string> = {
		connecting: 'Connecting…',
		disconnecting: 'Disconnecting…',
		pairing: 'Pairing…'
	};

	let bluetooth = $state<Bluetooth | null>(null);
	let request = $state<PairingRequest | null>(null);
	let forgetting = $state<Device | null>(null);
	let busy = $state<Record<string, Busy>>({});
	let problems = $state<Record<string, string>>({});

	let adapter = $derived(bluetooth?.adapter ?? null);

	function explain(reason: unknown) {
		return reason instanceof Error ? reason.message : String(reason);
	}

	function adapterSummary(adapter: Adapter) {
		if (!adapter.powered) return 'Off';
		return adapter.discoverable ? `Visible to nearby devices as “${adapter.name}”` : 'On';
	}

	function receive(next: PairingRequest) {
		const sameCode = next.kind === 'display' && request?.kind === 'display' && request.device === next.device && request.code === next.code;
		if (!sameCode) request = next;
	}

	function status(device: Device) {
		if (problems[device.path]) return problems[device.path];
		if (busy[device.path]) return BUSY_LABELS[busy[device.path]];
		const battery = device.battery === null ? '' : ` · ${device.battery}% battery`;
		return device.connected ? `Connected${battery}` : `Not connected${battery}`;
	}

	async function perform(device: Device, state: Busy, action: (path: string) => Promise<void>) {
		if (busy[device.path]) return;
		busy[device.path] = state;
		delete problems[device.path];
		try {
			await action(device.path);
		} catch (reason) {
			problems[device.path] = explain(reason);
		} finally {
			delete busy[device.path];
			if (request?.device === device.path) request = null;
		}
	}

	function toggle(device: Device) {
		void (device.connected ? perform(device, 'disconnecting', disconnect) : perform(device, 'connecting', connect));
	}

	async function power(enabled: boolean) {
		delete problems.adapter;
		try {
			await setPowered(enabled);
		} catch {
			problems.adapter = enabled ? "Couldn't turn Bluetooth on" : "Couldn't turn Bluetooth off";
		}
	}

	async function confirmForget(device: Device) {
		forgetting = null;
		try {
			await forget(device.path);
		} catch (reason) {
			problems[device.path] = explain(reason);
		}
	}

	onMount(() => {
		const stops = [onChanged((next) => (bluetooth = next)), onRequest(receive), onCancel(() => (request = null))];
		open()
			.then((initial) => (bluetooth = initial))
			.catch(() => (bluetooth = { adapter: null, paired: [], nearby: [] }));
		return () => {
			for (const stop of stops) stop();
			void close();
		};
	});
</script>

{#if bluetooth}
	{#if adapter}
		<Section>
			<Row
				title="Bluetooth"
				icon={BluetoothIcon}
				description={problems.adapter ?? adapterSummary(adapter)}
			>
				<Switch label="Bluetooth" checked={adapter.powered} onchange={power} />
			</Row>
		</Section>

		{#if bluetooth.paired.length}
			<Section title="My devices">
				{#each bluetooth.paired as device (device.path)}
					<ActionRow
						title={device.name}
						description={status(device)}
						alert={Boolean(problems[device.path])}
						icon={KIND_ICONS[device.kind]}
						disabled={!adapter.powered}
						onclick={() => toggle(device)}
					>
						{#snippet trailing()}
							{#if busy[device.path]}
								<LoaderCircle size={16} class="animate-spin" />
							{/if}
						{/snippet}
						{#snippet actions()}
							<IconButton icon={Trash} label="Forget" onclick={() => (forgetting = device)} />
						{/snippet}
					</ActionRow>
				{/each}
			</Section>
		{/if}

		{#if adapter.powered}
			<Section title="Nearby devices">
				{#each bluetooth.nearby as device (device.path)}
					<ActionRow
						title={device.name}
						description={problems[device.path] ?? (busy[device.path] ? BUSY_LABELS[busy[device.path]] : undefined)}
						alert={Boolean(problems[device.path])}
						icon={KIND_ICONS[device.kind]}
						onclick={() => perform(device, 'pairing', pair)}
					>
						{#snippet trailing()}
							{#if busy[device.path]}
								<LoaderCircle size={16} class="animate-spin" />
							{/if}
						{/snippet}
					</ActionRow>
				{:else}
					<Row title="Looking for devices…" description="Make sure the device you want to add is in pairing mode">
						<LoaderCircle size={16} class="animate-spin" />
					</Row>
				{/each}
			</Section>
		{/if}
	{:else}
		<Section>
			<Row title="No Bluetooth adapter found" description="Plug in an adapter to connect wireless devices" icon={BluetoothIcon} />
		</Section>
	{/if}
{/if}

{#if request}
	{#key request.id}
		<RequestDialog {request} onclose={() => (request = null)} />
	{/key}
{/if}

{#if forgetting}
	{@const device = forgetting}
	<Dialog title="Forget “{device.name}”?" description="You'll need to pair it again to use it with this computer." onclose={() => (forgetting = null)}>
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (forgetting = null)}>Cancel</button>
			<button type="button" class="button danger" onclick={() => confirmForget(device)}>Forget</button>
		{/snippet}
	</Dialog>
{/if}
