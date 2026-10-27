<script lang="ts">
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import Cloud from '@lucide/svelte/icons/cloud';
	import CloudOff from '@lucide/svelte/icons/cloud-off';
	import Pause from '@lucide/svelte/icons/pause';
	import Plus from '@lucide/svelte/icons/plus';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import { isInside, tooltip } from '@luft/ui';
	import type { Component } from 'svelte';
	import type { Drive } from '#lib/bindings.js';
	import * as api from '#lib/bridge/index.js';
	import type { DragController } from '#lib/file-manager/drag/controller.svelte.js';
	import { dropKey } from '#lib/file-manager/drag/drop-targets.js';
	import type { FileManager } from '#lib/file-manager/manager.svelte.js';
	import SidebarItem from './SidebarItem.svelte';

	interface Props {
		manager: FileManager;
		drag: DragController;
		adding: boolean;
		onopentab: (event: MouseEvent, open: () => void) => void;
	}

	let { manager, drag, adding, onopentab }: Props = $props();

	function mark(drive: Drive): { icon: Component; label: string; spinning?: boolean } | null {
		if (drive.state === 'signInAgain') return { icon: CircleAlert, label: 'Sign in again in Settings' };
		if (drive.paused) return { icon: Pause, label: drive.paused === 'metered' ? 'Paused on a metered connection' : 'Paused while the battery is low' };
		if (drive.syncing > 0) return { icon: RefreshCw, label: 'Syncing', spinning: true };
		return null;
	}

	function add() {
		api.addCloudAccount().catch(manager.notify);
	}
</script>

<div class="flex flex-none flex-col gap-px" role="group" aria-label="Cloud">
	<div class="sidebar-heading">
		<span>Cloud</span>
		{#if adding}
			<button class="sidebar-item__action" type="button" aria-label="Add a cloud account" onclick={add} {@attach tooltip('Add an account')}>
				<Plus size={15} />
			</button>
		{/if}
	</div>
	{#each manager.cloud.drives as drive (drive.account)}
		{@const key = dropKey('sidebar', drive.path)}
		{@const status = mark(drive)}
		<SidebarItem
			icon={drive.state === 'offline' ? CloudOff : Cloud}
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
						<status.icon size={14} class={status.spinning ? 'animate-spin' : ''} />
					</span>
				{/if}
			{/snippet}
		</SidebarItem>
	{/each}
</div>

<style>
	.sidebar-heading {
		display: flex;
		min-height: 30px;
		align-items: center;
		justify-content: space-between;
		padding-left: 12px;
		color: var(--sidebar-text-muted);
		font-size: 12.5px;
		font-weight: 500;
	}

	.sidebar-item__status {
		display: grid;
		margin-right: 12px;
		place-items: center;
		color: var(--sidebar-text-muted);
	}
</style>
