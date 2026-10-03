<script lang="ts">
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import { MenuButton, MenuItem, MenuSeparator } from '@luft/ui';
	import * as api from '$lib/api';
	import type { Drive } from '$lib/api';
	import { dialogs } from '$lib/dialogs/dialogs.svelte';
	import { disks } from '$lib/state/disks.svelte';
	import { imageActions } from './images';

	interface Props {
		drive: Drive;
	}

	let { drive }: Props = $props();

	let busy = $derived(disks.busy.has(drive.id) || Boolean(drive.job));
	let editable = $derived(!drive.system && !drive.readOnly);
</script>

<div class="flex flex-none items-center gap-2">
	{#if drive.removable && !drive.system}
		<button type="button" class="button" disabled={busy} onclick={() => disks.run(drive.id, () => api.safelyRemove(drive.id, drive.block))}>
			{drive.canPowerOff ? 'Safely remove' : 'Eject'}
		</button>
	{/if}
	{#if editable}
		<MenuButton label="More actions for {drive.name}" class="icon-button" align="end" minWidth={220} disabled={busy}>
			{#snippet trigger()}
				<Ellipsis size={18} />
			{/snippet}
			{#snippet children(close)}
				<MenuItem onclick={() => (close(), dialogs.open({ kind: 'format-drive', drive }))}>Format drive…</MenuItem>
				<MenuSeparator />
				{#each imageActions(drive, drive.block, drive.name) as action (action.label)}
					<MenuItem onclick={() => (close(), action.run())}>{action.label}</MenuItem>
				{/each}
			{/snippet}
		</MenuButton>
	{/if}
</div>
