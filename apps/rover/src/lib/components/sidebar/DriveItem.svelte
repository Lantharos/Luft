<script lang="ts">
	import Eject from '@lucide/svelte/icons/eject';
	import HardDrive from '@lucide/svelte/icons/hard-drive';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import Usb from '@lucide/svelte/icons/usb';
	import { bytes, tooltip } from '@luft/ui';
	import type { DriveInfo } from '#lib/bindings.js';
	import type { DragController } from '#lib/file-manager/drag/controller.svelte.js';
	import { dropKey } from '#lib/file-manager/drag/drop-targets.js';
	import type { FileManager, SidebarPlace } from '#lib/file-manager/manager.svelte.js';
	import SidebarItem from './SidebarItem.svelte';

	interface Props {
		drive: DriveInfo;
		manager: FileManager;
		drag: DragController;
		active: boolean;
		onopentab: (event: MouseEvent, open: () => void) => void;
		onmenu: (event: MouseEvent, place: SidebarPlace) => void;
	}

	let { drive, manager, drag, active, onopentab, onmenu }: Props = $props();

	const NEARLY_FULL = 0.9;

	let ejecting = $derived(manager.drives.ejecting.has(drive.mountPoint));
	let used = $derived(drive.totalSpace === 0 ? 0 : Math.min(1, drive.usedSpace / drive.totalSpace));
	let key = $derived(dropKey('sidebar', drive.mountPoint));
	let summary = $derived(`${bytes(drive.availableSpace)} free of ${bytes(drive.totalSpace)}`);
	let unmount = $derived(drive.isRemovable ? 'Eject' : 'Unmount');
</script>

<SidebarItem
	class="sidebar-item--drive"
	icon={ejecting ? RefreshCw : drive.isRemovable ? Usb : HardDrive}
	spinning={ejecting}
	label={ejecting ? `${drive.name} · ${drive.isRemovable ? 'Ejecting' : 'Unmounting'}` : drive.name}
	{active}
	dropping={drag.target?.key === key}
	disabled={ejecting}
	onclick={() => manager.navigate(drive.mountPoint)}
	onauxclick={(event) => onopentab(event, () => manager.openTab(drive.mountPoint))}
	oncontextmenu={(event) => onmenu(event, { kind: 'drive', drive })}
	ondragover={(event) => drag.overPath(event, drive.mountPoint, key)}
	ondragleave={drag.leave}
	ondrop={(event) => drag.drop(event, drive.mountPoint)}
	{@attach tooltip(summary)}
>
	{#snippet detail()}
		<span class="drive-usage" aria-label={summary}>
			<span class={['drive-usage__fill', used >= NEARLY_FULL && 'is-full']} style:transform="scaleX({used})"></span>
		</span>
	{/snippet}
	{#snippet trailing()}
		{#if drive.canUnmount}
			<button
				class="sidebar-item__action"
				type="button"
				disabled={ejecting}
				aria-label={`${unmount} ${drive.name}`}
				onclick={() => manager.ejectDrive(drive)}
				{@attach tooltip(unmount)}
			>
				<Eject size={15} />
			</button>
		{/if}
	{/snippet}
</SidebarItem>

<style>
	.drive-usage {
		display: block;
		height: 3px;
		overflow: hidden;
		border-radius: var(--radius-pill);
		background: var(--sidebar-control-hover);
	}

	.drive-usage__fill {
		display: block;
		height: 100%;
		border-radius: inherit;
		background: var(--accent);
		transform-origin: left center;
	}

	.drive-usage__fill.is-full {
		background: var(--danger);
	}
</style>
