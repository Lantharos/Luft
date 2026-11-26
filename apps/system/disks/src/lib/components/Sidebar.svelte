<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes, selectionPill } from '@luft/ui';
	import { disks } from '#lib/state/disks.svelte.js';
	import DriveIcon from './DriveIcon.svelte';
</script>

<aside class="glass-sidebar drag-region gap-3 p-(--sheet-inset)">
	<nav class="hidden-scroll scroll-fade flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto" aria-label={t('disks-drives')} {@attach selectionPill()}>
		{#each disks.drives as drive (drive.id)}
			{@const active = disks.drive?.id === drive.id}
			<button
				type="button"
				class="nav-item tall"
				class:active
				aria-current={active ? 'page' : undefined}
				onclick={() => disks.select(drive.id)}
			>
				<DriveIcon kind={drive.kind} />
				<span class="flex min-w-0 flex-1 flex-col">
					<span class="truncate">{drive.name || bytes(drive.size)}</span>
					<span class="nav-detail truncate">{bytes(drive.size)}</span>
				</span>
			</button>
		{/each}
		{#if disks.loaded && disks.drives.length === 0}
			<p class="px-3 text-[13px] text-[var(--sidebar-text-muted)]">{t('disks-no-drives')}</p>
		{/if}
	</nav>
</aside>

