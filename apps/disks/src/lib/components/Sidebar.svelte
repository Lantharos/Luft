<script lang="ts">
	import { bytes } from '$lib/format';
	import { disks } from '$lib/state/disks.svelte';
	import DriveIcon from './DriveIcon.svelte';
</script>

<aside class="glass-sidebar drag-region gap-3 px-3 py-4">
	<nav class="hidden-scroll scroll-fade flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto" aria-label="Drives">
		{#each disks.drives as drive (drive.id)}
			{@const active = disks.drive?.id === drive.id}
			<button
				type="button"
				class="nav-item"
				class:active
				aria-current={active ? 'page' : undefined}
				onclick={() => disks.select(drive.id)}
			>
				<DriveIcon kind={drive.kind} />
				<span class="flex min-w-0 flex-1 flex-col">
					<span class="truncate">{drive.name || bytes(drive.size)}</span>
					<span class="truncate text-[12px] text-[var(--sidebar-text-muted)]">{bytes(drive.size)}</span>
				</span>
			</button>
		{/each}
		{#if disks.loaded && disks.drives.length === 0}
			<p class="px-3 text-[13px] text-[var(--sidebar-text-muted)]">No drives found.</p>
		{/if}
	</nav>
</aside>

<style>
	.nav-item {
		display: flex;
		min-height: 52px;
		width: 100%;
		align-items: center;
		gap: 12px;
		border-radius: 16px;
		padding: 8px 12px;
		text-align: left;
		font-size: 14px;
		color: var(--sidebar-text);
		transition: background-color 150ms var(--ease), color 150ms var(--ease), transform 150ms var(--ease);
	}

	.nav-item:hover {
		background: var(--sidebar-control);
		color: var(--text);
	}

	.nav-item.active {
		background: var(--sidebar-active);
		color: var(--text);
		font-weight: 500;
	}

	.nav-item:active {
		transform: scale(0.98);
	}
</style>
