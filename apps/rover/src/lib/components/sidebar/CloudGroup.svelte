<script lang="ts">
	import { isInside, tooltip } from '@luft/ui';
	import * as api from '#lib/api.js';
	import Icon, { type IconName } from '#lib/components/Icon.svelte';
	import type { DragController } from '#lib/file-manager/drag/controller.svelte.js';
	import { dropKey } from '#lib/file-manager/drag/drop-targets.js';
	import type { FileManager } from '#lib/file-manager/manager.svelte.js';
	import type { CloudDrive } from '#lib/types/cloud.js';
	import SidebarItem from './SidebarItem.svelte';

	interface Props {
		manager: FileManager;
		drag: DragController;
		adding: boolean;
		onopentab: (event: MouseEvent, open: () => void) => void;
	}

	let { manager, drag, adding, onopentab }: Props = $props();

	function mark(drive: CloudDrive): { icon: IconName; label: string } | null {
		if (drive.state === 'signInAgain') return { icon: 'alert-circle', label: 'Sign in again in Settings' };
		if (drive.paused) return { icon: 'pause', label: drive.paused === 'metered' ? 'Paused on a metered connection' : 'Paused while the battery is low' };
		if (drive.syncing > 0) return { icon: 'refresh', label: 'Syncing' };
		return null;
	}

	function add() {
		api.addCloudAccount().catch(manager.notify);
	}
</script>

<div class="sidebar-group" role="group" aria-label="Cloud">
	<div class="sidebar-heading">
		<span>Cloud</span>
		{#if adding}
			<button class="sidebar-item__action" type="button" aria-label="Add a cloud account" onclick={add} {@attach tooltip('Add an account')}>
				<Icon name="plus" size={15} />
			</button>
		{/if}
	</div>
	{#each manager.cloud.drives as drive (drive.account)}
		{@const key = dropKey('sidebar', drive.path)}
		{@const status = mark(drive)}
		<SidebarItem
			icon={drive.state === 'offline' ? 'cloud-off' : 'cloud'}
			label={drive.name}
			active={manager.view === 'home' && isInside(manager.currentPath, drive.path)}
			dropping={drag.target?.key === key}
			onclick={() => manager.navigate(drive.path)}
			onauxclick={(event) => onopentab(event, () => manager.openTab(drive.path))}
			ondragover={(event) => drag.overPath(event, drive.path, key)}
			ondragleave={drag.leave}
			ondrop={(event) => drag.drop(event, drive.path)}
		>
			{#snippet trailing()}
				{#if status}
					<span class="sidebar-item__status" {@attach tooltip(status.label)}>
						<Icon name={status.icon} size={14} class={status.icon === 'refresh' ? 'animate-spin' : ''} />
					</span>
				{/if}
			{/snippet}
		</SidebarItem>
	{/each}
</div>
