<script lang="ts">
	import * as api from '$lib/api';
	import type { Drive } from '$lib/api';
	import { driveSummary } from '$lib/format';
	import { disks } from '$lib/state/disks.svelte';
	import ActionMenu from '../ActionMenu.svelte';
	import { driveMenu } from '../actions';

	interface Props {
		drive: Drive;
	}

	let { drive }: Props = $props();

	let busy = $derived(disks.busy.has(drive.id) || Boolean(drive.job));
	let summary = $derived([driveSummary(drive), drive.system && 'Runs this system'].filter(Boolean).join(' · '));
</script>

<div class="flex min-h-9 items-center gap-2 px-1.5">
	<p class="min-w-0 flex-1 truncate text-[14px] text-[var(--text-muted)]">{summary}</p>
	{#if drive.removable && !drive.system}
		<button type="button" class="button" disabled={busy} onclick={() => disks.run(drive.id, () => api.safelyRemove(drive.id, drive.block))}>
			{drive.canPowerOff ? 'Safely remove' : 'Eject'}
		</button>
	{/if}
	<ActionMenu label="More for {drive.name}" groups={driveMenu(drive)} disabled={busy} />
</div>
