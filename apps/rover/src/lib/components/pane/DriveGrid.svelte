<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import type { DragController } from '$lib/file-manager/drag/controller.svelte';
	import { dropKey } from '$lib/file-manager/drag/drop-targets';
	import type { FileManager } from '$lib/file-manager/manager.svelte';
	import type { DriveInfo } from '$lib/types';
	import { formatBytes } from '$lib/utils/format';

	interface Props {
		manager: FileManager;
		drag: DragController;
	}

	let { manager, drag }: Props = $props();

	let internal = $derived(manager.drives.list.filter((drive) => !drive.is_removable));
	let external = $derived(manager.drives.list.filter((drive) => drive.is_removable));

	function usage(drive: DriveInfo) {
		return drive.total_space === 0 ? 0 : Math.min(100, Math.round((drive.used_space / drive.total_space) * 100));
	}

	function openInTab(event: MouseEvent, drive: DriveInfo) {
		if (event.button !== 1) return;
		event.preventDefault();
		void manager.openTab(drive.mount_point);
	}
</script>

{#snippet tile(drive: DriveInfo)}
	{@const ejecting = manager.drives.ejecting.has(drive.mount_point)}
	{@const key = dropKey('drive', drive.mount_point)}
	<div
		class={['drive-tile', ejecting && 'opacity-60', drag.target?.key === key && 'drop-target-entry']}
		role="group"
		ondragover={(event) => !ejecting && drag.overPath(event, drive.mount_point, key)}
		ondragleave={drag.leave}
		ondrop={(event) => !ejecting && drag.drop(event, drive.mount_point)}
		data-drop-path={ejecting ? undefined : drive.mount_point}
		data-drop-key={ejecting ? undefined : key}
	>
		<button
			class="drive-open w-full text-left"
			type="button"
			disabled={ejecting}
			onclick={() => manager.navigate(drive.mount_point)}
			onauxclick={(event) => openInTab(event, drive)}
		>
			<div class="flex items-center gap-3">
				<div class="grid h-10 w-10 place-items-center rounded-full bg-[var(--control)] text-[var(--text-soft)]">
					<Icon
						name={ejecting ? 'refresh' : drive.is_removable ? 'usb' : 'hard-drive'}
						size={20}
						class={ejecting ? 'animate-spin' : ''}
					/>
				</div>
				<div class="min-w-0">
					<div class="truncate text-[14px] font-medium text-[var(--text)]">{drive.name}</div>
					<div class="truncate text-[12px] text-[var(--text-muted)]">{ejecting ? 'Ejecting' : drive.mount_point}</div>
				</div>
			</div>
			<div class="mt-4 h-2 overflow-hidden rounded-full bg-[var(--control)]">
				<div class="h-full rounded-full bg-[var(--text)]" style:width={`${usage(drive)}%`}></div>
			</div>
			<div class="mt-2 flex justify-between text-[12px] text-[var(--text-muted)]">
				<span>{formatBytes(drive.available_space)} free</span>
				<span>{usage(drive)}%</span>
			</div>
		</button>
	</div>
{/snippet}

<div class="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 pb-4 pt-2">
	{#each internal as drive (drive.mount_point)}
		{@render tile(drive)}
	{/each}
	{#if internal.length > 0 && external.length > 0}
		<div class="col-span-full my-1 h-px bg-[var(--hairline)]"></div>
	{/if}
	{#each external as drive (drive.mount_point)}
		{@render tile(drive)}
	{/each}
</div>
