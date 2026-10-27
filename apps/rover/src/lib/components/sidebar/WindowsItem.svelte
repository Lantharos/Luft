<script lang="ts">
	import HardDrive from '@lucide/svelte/icons/hard-drive';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import { Dialog, errorText } from '@luft/ui';
	import type { WindowsDrive } from '#lib/bindings.js';
	import type { FileManager } from '#lib/file-manager/manager.svelte.js';
	import SidebarItem from './SidebarItem.svelte';

	interface Props {
		drive: WindowsDrive;
		manager: FileManager;
	}

	let { drive, manager }: Props = $props();

	let asking = $state(false);
	let problem = $state('');

	let opening = $derived(manager.drives.opening.has(drive.device));

	async function open(readOnly: boolean) {
		asking = false;
		problem = '';
		try {
			await manager.navigate(await manager.drives.open(drive, readOnly));
		} catch (reason) {
			problem = errorText(reason);
		}
	}
</script>

<SidebarItem
	class="sidebar-item--drive"
	icon={opening ? RefreshCw : HardDrive}
	spinning={opening}
	label={drive.name}
	disabled={opening}
	onclick={() => (drive.hibernated ? (asking = true) : open(false))}
/>

{#if asking}
	<Dialog
		title="Windows is still asleep"
		description="Windows was hibernated or shut down with Fast Startup, so Luft opens its drive read-only to keep your files safe. To change files on it, start Windows and hold Shift while you choose Shut down."
		onclose={() => (asking = false)}
	>
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (asking = false)}>Cancel</button>
			<button type="button" class="button primary" onclick={() => open(true)}>Open read-only</button>
		{/snippet}
	</Dialog>
{/if}

{#if problem}
	<Dialog title="{drive.name} couldn’t be opened" description={problem} onclose={() => (problem = '')}>
		{#snippet actions()}
			<button type="button" class="button primary" onclick={() => (problem = '')}>OK</button>
		{/snippet}
	</Dialog>
{/if}
