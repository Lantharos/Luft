<script lang="ts">
	import Camera from '@lucide/svelte/icons/camera';
	import Eject from '@lucide/svelte/icons/eject';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import Smartphone from '@lucide/svelte/icons/smartphone';
	import { isInside, tooltip } from '@luft/ui';
	import type { DragController } from '#lib/file-manager/drag/controller.svelte.js';
	import { dropKey } from '#lib/file-manager/drag/drop-targets.js';
	import type { FileManager } from '#lib/file-manager/manager.svelte.js';
	import type { DeviceEntry } from '#lib/file-manager/places/network.svelte.js';
	import SidebarItem from './SidebarItem.svelte';

	interface Props {
		device: DeviceEntry;
		manager: FileManager;
		drag: DragController;
		onopentab: (event: MouseEvent, open: () => void) => void;
	}

	let { device, manager, drag, onopentab }: Props = $props();

	let location = $derived(device.location);
	let connecting = $derived(manager.network.connecting.has(device.uri));
	let active = $derived(Boolean(location) && manager.view === 'home' && isInside(manager.currentPath, location!.path));
	let key = $derived(location ? dropKey('sidebar', location.path) : undefined);
</script>

<SidebarItem
	icon={connecting ? RefreshCw : device.camera ? Camera : Smartphone}
	spinning={connecting}
	label={device.name}
	{active}
	dropping={Boolean(key) && drag.target?.key === key}
	onclick={() => manager.openDevice(device)}
	onauxclick={(event) => onopentab(event, () => manager.openDevice(device, manager.openTab))}
	ondragover={(event) => location && key && drag.overPath(event, location.path, key)}
	ondragleave={drag.leave}
	ondrop={(event) => location && drag.drop(event, location.path)}
>
	{#snippet trailing()}
		{#if location}
			<button
				class="sidebar-item__action"
				type="button"
				aria-label={`Eject ${device.name}`}
				onclick={() => manager.disconnectNetwork(location.uri)}
				{@attach tooltip('Eject')}
			>
				<Eject size={15} />
			</button>
		{/if}
	{/snippet}
</SidebarItem>
