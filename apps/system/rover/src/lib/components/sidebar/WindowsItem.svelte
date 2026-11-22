<script lang="ts">
	import HardDrive from '@luft/symbols/icons/hard-drive';
	import RefreshCw from '@luft/symbols/icons/refresh-cw';
	import { t } from '@luft/i18n';
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
		title={t('rover-windows-asleep-title')}
		description={t('rover-windows-asleep-description')}
		onclose={() => (asking = false)}
	>
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (asking = false)}>{t('rover-cancel')}</button>
			<button type="button" class="button primary" onclick={() => open(true)}>{t('rover-windows-open-read-only')}</button>
		{/snippet}
	</Dialog>
{/if}

{#if problem}
	<Dialog title={t('rover-windows-failed', { name: drive.name })} description={problem} onclose={() => (problem = '')}>
		{#snippet actions()}
			<button type="button" class="button primary" onclick={() => (problem = '')}>{t('rover-ok')}</button>

		{/snippet}
	</Dialog>
{/if}
