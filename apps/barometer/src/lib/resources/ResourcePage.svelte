<script lang="ts">
	import type { Devices } from '$lib/backend/types';
	import BatteryPage from './battery/BatteryPage.svelte';
	import CpuPage from './cpu/CpuPage.svelte';
	import DrivePage from './drive/DrivePage.svelte';
	import GpuPage from './gpu/GpuPage.svelte';
	import MemoryPage from './memory/MemoryPage.svelte';
	import NetworkPage from './network/NetworkPage.svelte';
	import { byId } from './registry';

	interface Props {
		page: string;
		devices: Devices;
	}

	let { page, devices }: Props = $props();

	let gpu = $derived(byId(devices.gpus, page));
	let drive = $derived(byId(devices.drives, page));
	let network = $derived(byId(devices.networks, page));
	let battery = $derived(byId(devices.batteries, page));
</script>

{#if page === 'cpu'}
	<CpuPage info={devices.cpu} />
{:else if page === 'memory'}
	<MemoryPage />
{:else if gpu}
	<GpuPage info={gpu} />
{:else if drive}
	<DrivePage info={drive} />
{:else if network}
	<NetworkPage info={network} />
{:else if battery}
	<BatteryPage info={battery} />
{/if}
