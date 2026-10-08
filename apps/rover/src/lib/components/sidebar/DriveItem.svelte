<script lang="ts">
	import { bytes, tooltip } from '@luft/ui';
	import Icon from '#lib/components/Icon.svelte';
	import type { DragController } from '#lib/file-manager/drag/controller.svelte.js';
	import { dropKey } from '#lib/file-manager/drag/drop-targets.js';
	import type { FileManager, SidebarPlace } from '#lib/file-manager/manager.svelte.js';
	import type { DriveInfo } from '#lib/types/index.js';
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

	let ejecting = $derived(manager.drives.ejecting.has(drive.mount_point));
	let used = $derived(drive.total_space === 0 ? 0 : Math.min(1, drive.used_space / drive.total_space));
	let key = $derived(dropKey('sidebar', drive.mount_point));
	let summary = $derived(`${bytes(drive.available_space)} free of ${bytes(drive.total_space)}`);
</script>

<SidebarItem
	class="sidebar-item--drive"
	icon={ejecting ? 'refresh' : drive.is_removable ? 'usb' : 'hard-drive'}
	spinning={ejecting}
	label={ejecting ? `${drive.name} · Ejecting` : drive.name}
	{active}
	dropping={drag.target?.key === key}
	disabled={ejecting}
	onclick={() => manager.navigate(drive.mount_point)}
	onauxclick={(event) => onopentab(event, () => manager.openTab(drive.mount_point))}
	oncontextmenu={(event) => onmenu(event, { kind: 'drive', drive })}
	ondragover={(event) => drag.overPath(event, drive.mount_point, key)}
	ondragleave={drag.leave}
	ondrop={(event) => drag.drop(event, drive.mount_point)}
	{@attach tooltip(summary)}
>
	{#snippet detail()}
		<span class="drive-usage" aria-label={summary}>
			<span class={['drive-usage__fill', used >= NEARLY_FULL && 'is-full']} style:transform="scaleX({used})"></span>
		</span>
	{/snippet}
	{#snippet trailing()}
		{#if drive.is_removable}
			<button
				class="sidebar-item__action"
				type="button"
				disabled={ejecting}
				aria-label={`Eject ${drive.name}`}
				onclick={() => manager.ejectDrive(drive)}
				{@attach tooltip('Eject')}
			>
				<Icon name="eject" size={15} />
			</button>
		{/if}
	{/snippet}
</SidebarItem>
