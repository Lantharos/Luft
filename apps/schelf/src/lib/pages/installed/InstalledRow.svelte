<script lang="ts">
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import { MenuButton, MenuItem } from '@luft/ui';
	import type { InstalledApp } from '#lib/bridge/types.js';
	import AppArt from '#lib/components/AppArt.svelte';
	import ProgressButton from '#lib/components/ProgressButton.svelte';
	import { updateJob } from '#lib/app/jobs.js';
	import { bytes, sourceName } from '#lib/format.js';
	import { backend } from '#lib/state/backend.js';
	import { library } from '#lib/state/library.svelte.js';
	import { navigation } from '#lib/state/navigation.svelte.js';
	import { operations } from '#lib/state/operations.svelte.js';

	let { app, onremove }: { app: InstalledApp; onremove: (app: InstalledApp) => void } = $props();

	const operation = $derived(operations.forKey(app.key));
	const active = $derived(operation && operation.state !== 'failed' ? operation : null);
	const update = $derived(library.update(app.key));
	const detail = $derived.by(() => {
		if (operation?.state === 'failed') return operation.error;
		const parts = [sourceName(app.source, app.origin), app.version, app.size ? bytes(app.size) : null];
		return parts.filter(Boolean).join(' · ');
	});

	function updateNow() {
		if (update) void operations.run(app.key, app.name, updateJob(update));
	}
</script>

<div class="row">
	<button type="button" class="main" onclick={() => navigation.push({ page: 'app', target: { installed: app.key }, name: app.name })}>
		<AppArt icon={app.icon} desktop={app.desktop} size={40} />
		<span class="flex min-w-0 flex-col gap-0.5">
			<span class="truncate text-[14px] font-medium">{app.name}</span>
			<span class="truncate text-[12.5px]" class:failed={operation?.state === 'failed'}>{detail}</span>
		</span>
	</button>
	<div class="flex flex-none items-center gap-2">
		{#if active}
			<ProgressButton operation={active} />
		{:else}
			{#if update}
				<button type="button" class="button" onclick={updateNow}>Update</button>
			{/if}
			{#if app.desktop}
				<button type="button" class="button" onclick={() => backend().launch(app.desktop!)}>Open</button>
			{/if}
			<MenuButton label="More for {app.name}" class="icon-button" align="end">
				{#snippet trigger()}<Ellipsis size={18} />{/snippet}
				{#snippet children(close)}
					<MenuItem
						onclick={() => {
							close();
							navigation.push({ page: 'app', target: { installed: app.key }, name: app.name });
						}}>Details</MenuItem
					>
					<MenuItem
						danger
						onclick={() => {
							close();
							onremove(app);
						}}>Remove</MenuItem
					>
				{/snippet}
			</MenuButton>
		{/if}
	</div>
</div>

<style>
	.row {
		display: flex;
		height: 100%;
		align-items: center;
		gap: 8px;
		border-radius: var(--radius-group);
		padding-right: 12px;
		transition: background-color 160ms var(--ease);
	}

	.row:has(.main:hover) {
		background: var(--surface-hover);
	}

	.main {
		display: flex;
		min-width: 0;
		flex: 1;
		align-items: center;
		gap: 14px;
		align-self: stretch;
		padding-left: 14px;
		text-align: left;
		color: var(--text-muted);
	}

	.main .font-medium {
		color: var(--text);
	}

	.failed {
		color: var(--danger);
	}
</style>
