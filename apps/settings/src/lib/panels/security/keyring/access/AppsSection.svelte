<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import { AppIcon, IconButton, Section } from '@luft/ui';
	import { revoke, type AppAccess, type Item } from '../api';
	import { Runner } from '../runner.svelte';

	let { apps, refresh }: { apps: AppAccess[]; refresh: () => Promise<void> } = $props();

	const runner = new Runner(() => refresh());

	const removal = (app: AppAccess, item: Item) =>
		item.allowed ? `Stop ${app.name} from using ${item.label}` : `Let ${app.name} ask for ${item.label} again`;
</script>

<Section description="Removing one makes the app ask again next time.">
	{#each apps as app (app.key)}
		<div class="flex flex-col pb-2">
			<div class="flex items-center gap-3.5 px-4 pt-3.5 pb-1.5">
				<AppIcon icon={app.icon} id={app.id ?? undefined} size={28} />
				<span class="min-w-0 truncate text-[14px] font-medium">{app.name}</span>
			</div>
			{#each app.items as item (item.path)}
				<div class="flex min-h-9 items-center gap-3 pr-3 pl-[58px]">
					<span class="min-w-0 flex-1 truncate text-[13px] text-[var(--text-soft)]">{item.label}</span>
					{#if !item.allowed}
						<span class="shrink-0 text-[12.5px] text-[var(--text-muted)]">Not allowed</span>
					{/if}
					<IconButton icon={X} label={removal(app, item)} disabled={runner.busy} onclick={() => runner.run(() => revoke(app.key, item.path))} />
				</div>
			{/each}
		</div>
	{:else}
		<p class="px-4 py-3.5 text-[13px] text-[var(--text-muted)]">No apps have asked for your passwords yet</p>
	{/each}
</Section>

{#if runner.error}
	<p class="-mt-4 px-2 text-[13px] text-[var(--danger)]">{runner.error}</p>
{/if}
