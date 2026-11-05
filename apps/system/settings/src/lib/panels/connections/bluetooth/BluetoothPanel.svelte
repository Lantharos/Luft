<script lang="ts">
	import BluetoothIcon from '@lucide/svelte/icons/bluetooth';
	import Eye from '@lucide/svelte/icons/eye';
	import Info from '@lucide/svelte/icons/info';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { onMount } from 'svelte';
	import { t } from '@luft/i18n';
	import { ActionRow, Dialog, errorText, IconButton, item, reorder, Row, Section, Select, Switch } from '@luft/ui';
	import { commands, events } from '#lib/bindings.js';
	import type { Adapter, Bluetooth, BluetoothDevice, PairingRequest } from '#lib/bindings.js';
	import MoreRow, { COLLAPSED } from '#lib/components/MoreRow.svelte';
	import { percent } from '#lib/format.js';
	import DeviceDialog from './DeviceDialog.svelte';
	import RequestDialog from './RequestDialog.svelte';
	import WindowsDevices from './WindowsDevices.svelte';
	import { pair } from './api';
	import { KIND_ICONS } from './kinds';

	type Busy = 'connecting' | 'disconnecting' | 'pairing';

	const BUSY_LABELS: Record<Busy, string> = {
		connecting: 'settings-bluetooth-connecting',
		disconnecting: 'settings-bluetooth-disconnecting',
		pairing: 'settings-bluetooth-pairing'
	};

	const VISIBILITY = [180, 600, 1800, 0];

	let bluetooth = $state<Bluetooth | null>(null);
	let request = $state<PairingRequest | null>(null);
	let forgetting = $state<BluetoothDevice | null>(null);
	let inspecting = $state<string | null>(null);
	let busy = $state<Record<string, Busy>>({});
	let expanded = $state(false);
	let problems = $state<Record<string, string>>({});

	let adapter = $derived(bluetooth?.adapter ?? null);
	let inspected = $derived(bluetooth?.paired.find((device) => device.path === inspecting));
	let nearby = $derived(bluetooth ? (expanded ? bluetooth.nearby : bluetooth.nearby.slice(0, COLLAPSED)) : []);

	function visibilityLabel(timeout: number) {
		return timeout ? t('settings-bluetooth-visible-for', { minutes: Math.round(timeout / 60) }) : t('settings-bluetooth-visible-until-off');
	}

	function visibilityOptions(adapter: Adapter) {
		const timeout = adapter.discoverableTimeout;
		const values = VISIBILITY.includes(timeout) ? VISIBILITY : [...VISIBILITY, timeout];
		return values.map((value) => ({ value, label: visibilityLabel(value) }));
	}

	async function changeVisibility(visible: boolean, timeout: number) {
		delete problems.visibility;
		try {
			await commands.bluetoothSetVisible({ visible, timeout });
		} catch {
			problems.visibility = t('settings-bluetooth-visible-failed');
		}
	}

	async function trust(device: BluetoothDevice, trusted: boolean) {
		try {
			await commands.bluetoothSetTrusted({ device: device.path, trusted });
		} catch (reason) {
			problems[device.path] = errorText(reason);
		}
	}

	function receive(next: PairingRequest) {
		const sameCode = next.kind === 'display' && request?.kind === 'display' && request.device === next.device && request.code === next.code;
		if (!sameCode) request = next;
	}

	function status(device: BluetoothDevice) {
		if (problems[device.path]) return problems[device.path];
		if (busy[device.path]) return t(BUSY_LABELS[busy[device.path]]);
		if (!device.connected) return undefined;
		return device.battery === null ? t('settings-bluetooth-connected') : t('settings-bluetooth-connected-battery', { battery: percent(device.battery / 100) });
	}

	async function perform(device: BluetoothDevice, state: Busy, action: (path: string) => Promise<unknown>) {
		if (busy[device.path]) return;
		busy[device.path] = state;
		delete problems[device.path];
		try {
			await action(device.path);
		} catch (reason) {
			problems[device.path] = errorText(reason);
		} finally {
			delete busy[device.path];
			if (request?.device === device.path) request = null;
		}
	}

	function toggle(device: BluetoothDevice) {
		void (device.connected ? perform(device, 'disconnecting', (path) => commands.bluetoothDisconnect({ device: path })) : perform(device, 'connecting', (path) => commands.bluetoothConnect({ device: path })));
	}

	async function power(enabled: boolean) {
		delete problems.adapter;
		try {
			await commands.bluetoothSetPowered({ enabled });
		} catch {
			problems.adapter = enabled ? t('settings-bluetooth-power-on-failed') : t('settings-bluetooth-power-off-failed');
		}
	}

	function startForget(device: BluetoothDevice) {
		inspecting = null;
		forgetting = device;
	}

	async function confirmForget(device: BluetoothDevice) {
		forgetting = null;
		try {
			await commands.bluetoothForget({ device: device.path });
		} catch (reason) {
			problems[device.path] = errorText(reason);
		}
	}

	onMount(() => {
		const stops = [events.bluetoothChanged((next) => (bluetooth = next)), events.bluetoothRequest(receive), events.bluetoothCancel(() => (request = null))];
		commands.bluetoothOpen()
			.then((initial) => (bluetooth = initial))
			.catch(() => (bluetooth = { adapter: null, hardwareBlocked: false, paired: [], nearby: [] }));
		return () => {
			for (const stop of stops) stop();
			void commands.bluetoothClose();
		};
	});
</script>

{#if bluetooth}
	{#if adapter}
		<Section>
			<Row
				title={t('settings-page-bluetooth')}
				icon={BluetoothIcon}
				description={problems.adapter ?? (bluetooth.hardwareBlocked ? t('settings-bluetooth-hardware-off') : undefined)}
			>
				<Switch label={t('settings-page-bluetooth')} checked={adapter.powered} disabled={bluetooth.hardwareBlocked} onchange={power} />
			</Row>
			{#if adapter.powered}
				<Row
					title={t('settings-bluetooth-visible')}
					icon={Eye}
					description={problems.visibility ??
						(adapter.discoverable ? t('settings-bluetooth-visible-as', { name: adapter.name }) : t('settings-bluetooth-visible.description'))}
					truncate
				>
					<Select
						label={t('settings-bluetooth-visible-duration')}
						options={visibilityOptions(adapter)}
						value={adapter.discoverableTimeout}
						onchange={(timeout) => changeVisibility(adapter.discoverable, timeout)}
					/>
					<Switch label={t('settings-bluetooth-visible')} checked={adapter.discoverable} onchange={(on) => changeVisibility(on, adapter.discoverableTimeout)} />
				</Row>
			{/if}
		</Section>

		{#if bluetooth.paired.length}
			<Section title={t('settings-bluetooth-paired')}>
				{#each bluetooth.paired as device (device.path)}
					<div class="row-slot" animate:reorder in:item out:item>
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
								<IconButton icon={Info} label={t('settings-bluetooth-details')} onclick={() => (inspecting = device.path)} />
							{/snippet}
						</ActionRow>
					</div>
				{/each}
			</Section>
		{/if}

		{#if adapter.powered}
			<WindowsDevices />
			<Section title={t('settings-bluetooth-nearby')}>
				{#each nearby as device (device.path)}
					<div class="row-slot" animate:reorder in:item out:item>
						<ActionRow
							title={device.name}
							description={problems[device.path] ?? (busy[device.path] ? t(BUSY_LABELS[busy[device.path]]) : undefined)}
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
					</div>
				{:else}
					<Row title={t('settings-bluetooth-searching')} description={t('settings-bluetooth-searching.description')}>
						<LoaderCircle size={16} class="animate-spin" />
					</Row>
				{/each}
				{#if bluetooth.nearby.length > COLLAPSED}
					<MoreRow hidden={bluetooth.nearby.length - COLLAPSED} bind:expanded />
				{/if}
			</Section>
		{/if}
	{:else if bluetooth.hardwareBlocked}
		<Section>
			<Row title={t('settings-bluetooth-blocked')} description={t('settings-bluetooth-blocked.description')} icon={BluetoothIcon} />
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
	<Dialog
		title={t('settings-bluetooth-forget-confirm', { name: device.name })}
		description={t('settings-bluetooth-forget-confirm.description')}
		onclose={() => (forgetting = null)}
	>
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (forgetting = null)}>{t('settings-bluetooth-cancel')}</button>
			<button type="button" class="button danger" onclick={() => confirmForget(device)}>{t('settings-bluetooth-forget')}</button>
		{/snippet}
	</Dialog>
{/if}
