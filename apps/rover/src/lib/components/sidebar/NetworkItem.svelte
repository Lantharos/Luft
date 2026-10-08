<script lang="ts">
	import { isInside, tooltip } from '@luft/ui';
	import Icon from '#lib/components/Icon.svelte';
	import type { DragController } from '#lib/file-manager/drag/controller.svelte.js';
	import { dropKey } from '#lib/file-manager/drag/drop-targets.js';
	import type { FileManager, SidebarPlace } from '#lib/file-manager/manager.svelte.js';
	import type { NetworkEntry } from '#lib/file-manager/places/network.svelte.js';
	import SidebarItem from './SidebarItem.svelte';

	interface Props {
		entry: NetworkEntry;
		manager: FileManager;
		drag: DragController;
		onopentab: (event: MouseEvent, open: () => void) => void;
		onmenu: (event: MouseEvent, place: SidebarPlace) => void;
	}

	let { entry, manager, drag, onopentab, onmenu }: Props = $props();

	let location = $derived(entry.location);
	let connecting = $derived(manager.network.connecting.has(entry.place.uri));
	let active = $derived(Boolean(location) && manager.view === 'home' && isInside(manager.currentPath, location!.path));
	let key = $derived(location ? dropKey('sidebar', location.path) : undefined);

	function open(show: (path: string) => Promise<void>) {
		if (location) void show(location.path);
		else void manager.openAddress(entry.place.uri, show);
	}
</script>

<SidebarItem
	icon={connecting ? 'refresh' : location?.device ? 'smartphone' : 'server'}
	spinning={connecting}
	label={location?.name ?? entry.place.name}
	{active}
	dropping={Boolean(key) && drag.target?.key === key}
	onclick={() => open(manager.navigate)}
	onauxclick={(event) => onopentab(event, () => open(manager.openTab))}
	oncontextmenu={(event) => onmenu(event, { kind: 'network', entry })}
	ondragover={(event) => location && key && drag.overPath(event, location.path, key)}
	ondragleave={drag.leave}
	ondrop={(event) => location && drag.drop(event, location.path)}
	{@attach tooltip(entry.place.uri)}
>
	{#snippet trailing()}
		{#if location}
			<button
				class="sidebar-item__action"
				type="button"
				aria-label={`Disconnect ${location.name}`}
				onclick={() => manager.disconnectNetwork(location.uri)}
				{@attach tooltip('Disconnect')}
			>
				<Icon name="eject" size={15} />
			</button>
		{/if}
	{/snippet}
</SidebarItem>
