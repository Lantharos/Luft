<script lang="ts">
	import BluetoothIcon from '@lucide/svelte/icons/bluetooth';
	import Eye from '@lucide/svelte/icons/eye';
	import Info from '@lucide/svelte/icons/info';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { onMount } from 'svelte';
	import { ActionRow, Dialog, IconButton, Row, Section, Select, Switch } from '@luft/ui';
	import DeviceDialog from './DeviceDialog.svelte';
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
		setTrusted,
		setVisible,
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

	const VISIBILITY = [
		{ value: 180, label: 'For 3 minutes' },
		{ value: 600, label: 'For 10 minutes' },
		{ value: 1800, label: 'For 30 minutes' },
		{ value: 0, label: 'Until turned off' }
	];

	let bluetooth = $state<Bluetooth | null>(null);
	let request = $state<PairingRequest | null>(null);
	let forgetting = $state<Device | null>(null);
	let inspecting = $state<string | null>(null);
	let busy = $state<Record<string, Busy>>({});
	let problems = $state<Record<string, string>>({});

	let adapter = $derived(bluetooth?.adapter ?? null);
	let inspected = $derived(bluetooth?.paired.find((device) => device.path === inspecting));

	function explain(reason: unknown) {
		return reason instanceof Error ? reason.message : String(reason);
	}

	function adapterSummary(adapter: Adapter) {
		if (bluetooth?.hardwareBlocked) return 'Turned off with a hardware switch';
		return adapter.powered ? 'On' : 'Off';
	}

	function visibilityOptions(adapter: Adapter) {
		const timeout = adapter.discoverableTimeout;
		if (VISIBILITY.some((option) => option.value === timeout)) return VISIBILITY;
		return [...VISIBILITY, { value: timeout, label: `For ${Math.round(timeout / 60)} minutes` }];
	}

	async function changeVisibility(visible: boolean, timeout: number) {
		delete problems.visibility;
		try {
			await setVisible(visible, timeout);
		} catch {
			problems.visibility = "Couldn't change whether this computer is visible";
		}
	}

	async function trust(device: Device, trusted: boolean) {
		try {
			await setTrusted(device.path, trusted);
		} catch (reason) {
			problems[device.path] = explain(reason);
		}
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

	function startForget(device: Device) {
		inspecting = null;
		forgetting = device;
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
			.catch(() => (bluetooth = { adapter: null, hardwareBlocked: false, paired: [], nearby: [] }));
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
				<Switch label="Bluetooth" checked={adapter.powered} disabled={bluetooth.hardwareBlocked} onchange={power} />
			</Row>
			{#if adapter.powered}
				<Row
					title="Visible to nearby devices"
					icon={Eye}
					description={problems.visibility ?? (adapter.discoverable ? `Shown as “${adapter.name}”` : 'Lets phones and other computers find this one to pair')}
				>
					<Select
						label="Stay visible"
						options={visibilityOptions(adapter)}
						value={adapter.discoverableTimeout}
						onchange={(timeout) => changeVisibility(adapter.discoverable, timeout)}
					/>
					<Switch label="Visible to nearby devices" checked={adapter.discoverable} onchange={(on) => changeVisibility(on, adapter.discoverableTimeout)} />
				</Row>
			{/if}
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
							<IconButton icon={Info} label="Device details" onclick={() => (inspecting = device.path)} />
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
	{:else if bluetooth.hardwareBlocked}
		<Section>
			<Row title="Bluetooth is turned off with a hardware switch" description="Use the switch or key on your computer to turn it back on" icon={BluetoothIcon} />
		</Section>
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

{#if inspected}
	{@const device = inspected}
	<DeviceDialog
		{device}
		busy={Boolean(busy[device.path])}
		ontrust={(trusted) => trust(device, trusted)}
		ontoggle={() => toggle(device)}
		onforget={() => startForget(device)}
		onclose={() => (inspecting = null)}
	/>
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
