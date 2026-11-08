<script lang="ts">
	import Globe from '@lucide/svelte/icons/globe';
	import Network from '@lucide/svelte/icons/network';
	import Usb from '@lucide/svelte/icons/usb';
	import { t } from '@luft/i18n';
	import { Dialog, errorText, SearchField, Spinner, TextField } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { PrinterDevice, PrinterDriver } from '#lib/bindings.js';
	import ChoiceList from './ChoiceList.svelte';

	interface Props {
		onadded: (name: string) => void;
		onclose: () => void;
	}

	let { onadded, onclose }: Props = $props();

	type Step = 'devices' | 'address' | 'driver' | 'adding';

	const SHOWN_DRIVERS = 60;

	let step = $state<Step>('devices');
	let devices = $state<PrinterDevice[] | null>(null);
	let device = $state<PrinterDevice | null>(null);
	let drivers = $state<PrinterDriver[] | null>(null);
	let address = $state('');
	let search = $state('');
	let problem = $state('');

	let found = $derived(devices ?? []);
	let suited = $derived((drivers ?? []).filter((driver) => driver.suits));
	let others = $derived.by(() => {
		const words = search.toLowerCase().split(/\s+/).filter(Boolean);
		return (drivers ?? [])
			.filter((driver) => !driver.suits && words.every((word) => driver.description.toLowerCase().includes(word)))
			.slice(0, SHOWN_DRIVERS);
	});

	const deviceName = (candidate: PrinterDevice) => candidate.name || candidate.model || candidate.uri;

	$effect(() => {
		commands
			.printersDevices()
			.then((list) => (devices = list))
			.catch((reason) => {
				devices = [];
				problem = errorText(reason);
			});
	});

	async function add(uri: string, driver: string, name: string) {
		step = 'adding';
		problem = '';
		try {
			onadded(await commands.printersAdd({ device: uri, driver, name, location: '' }));
		} catch (reason) {
			problem = errorText(reason);
			step = device?.link === 'usb' ? 'driver' : address ? 'address' : 'devices';
		}
	}

	async function choose(candidate: PrinterDevice) {
		device = candidate;
		if (candidate.link === 'network') return add(candidate.uri, '', deviceName(candidate));
		step = 'driver';
		drivers = null;
		try {
			drivers = await commands.printersDrivers({ deviceId: candidate.deviceId, model: candidate.model });
		} catch (reason) {
			drivers = [];
			problem = errorText(reason);
		}
	}

	function addressUri(text: string) {
		const trimmed = text.trim();
		return trimmed.includes('://') ? trimmed : `ipp://${trimmed}/ipp/print`;
	}

	function back() {
		problem = '';
		search = '';
		device = null;
		address = '';
		step = 'devices';
	}

	let title = $derived(step === 'driver' && device ? t('settings-printers-driver-title', { name: deviceName(device) }) : t('settings-printers-add'));
	let description = $derived(
		step === 'address' ? t('settings-printers-address-description') : step === 'driver' ? t('settings-printers-driver-description') : t('settings-printers-add-dialog-description')
	);
</script>

<Dialog {title} {description} wide={step === 'driver'} onclose={() => step !== 'adding' && onclose()}>
	{#if step === 'adding'}
		<div class="waiting"><Spinner size={18} />{t('settings-printers-adding')}</div>
	{:else if step === 'devices'}
		{#if devices === null}
			<div class="waiting"><Spinner size={18} />{t('settings-printers-searching')}</div>
		{:else}
			<ChoiceList
				options={[
					...found.map((candidate) => ({
						id: candidate.uri,
						icon: candidate.link === 'usb' ? Usb : Network,
						label: deviceName(candidate),
						detail: candidate.link === 'usb' ? t('settings-printers-by-usb') : t('settings-printers-on-network')
					})),
					{ id: '', icon: Globe, label: t('settings-printers-by-address'), detail: t('settings-printers-by-address-detail') }
				]}
				onchoose={(id) => {
					const candidate = found.find((option) => option.uri === id);
					if (candidate) void choose(candidate);
					else step = 'address';
				}}
			/>
			{#if !found.length}
				<p class="hint">{t('settings-printers-none-found')}</p>
			{/if}
		{/if}
	{:else if step === 'address'}
		<TextField
			bind:value={address}
			label={t('settings-printers-address')}
			showLabel
			placeholder="192.168.1.20"
			onkeydown={(event) => event.key === 'Enter' && address.trim() && add(addressUri(address), '', address.trim())}
		/>
	{:else if drivers === null}
		<div class="waiting"><Spinner size={18} />{t('settings-printers-finding-drivers')}</div>
	{:else}
		{#if suited.length}
			<ChoiceList
				options={suited.map((driver, index) => ({ id: driver.name, label: driver.description, detail: index === 0 ? t('settings-printers-driver-best') : undefined }))}
				onchoose={(name) => device && add(device.uri, name, deviceName(device))}
			/>
		{/if}
		{#if drivers.length > suited.length}
			<SearchField bind:value={search} label={t('settings-printers-driver-search')} />
			<div class="others">
				<ChoiceList
					options={others.map((driver) => ({ id: driver.name, label: driver.description }))}
					onchoose={(name) => device && add(device.uri, name, deviceName(device))}
				/>
			</div>
		{:else if !drivers.length}
			<p class="hint">{t('settings-printers-no-drivers')}</p>
		{/if}
	{/if}
	{#if problem}
		<p class="problem">{problem}</p>
	{/if}
	{#snippet actions()}
		{#if step === 'devices'}
			<button type="button" class="button" onclick={onclose}>{t('settings-printers-cancel')}</button>
		{:else if step === 'address'}
			<button type="button" class="button" onclick={back}>{t('settings-printers-back')}</button>
			<button type="button" class="button primary" disabled={!address.trim()} onclick={() => add(addressUri(address), '', address.trim())}>{t('settings-printers-add-button')}</button>
		{:else if step === 'driver'}
			<button type="button" class="button" onclick={back}>{t('settings-printers-back')}</button>
		{/if}
	{/snippet}
</Dialog>

<style>
	.waiting {
		display: flex;
		min-height: 64px;
		align-items: center;
		gap: 12px;
		font-size: 13.5px;
		color: var(--text-soft);
	}

	.hint {
		font-size: 13px;
		color: var(--text-soft);
	}

	.problem {
		font-size: 13px;
		color: var(--danger);
	}

	.others {
		max-height: 280px;
		overflow-x: hidden;
		overflow-y: auto;
		margin-inline: -6px;
		padding-inline: 6px;
	}
</style>
