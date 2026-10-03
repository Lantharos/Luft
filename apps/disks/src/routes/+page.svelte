<script lang="ts">
	import { onMount } from 'svelte';
	import { isAvailable } from '@lantharos/sabine';
	import { appearance, GlassShell, WindowControls } from '@luft/ui';
	import DriveView from '$lib/components/drive/DriveView.svelte';
	import Notice from '$lib/components/Notice.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import DialogHost from '$lib/dialogs/DialogHost.svelte';
	import { disks } from '$lib/state/disks.svelte';

	onMount(() => {
		if (isAvailable()) void disks.start();
	});

	$effect(() => {
		document.documentElement.dataset.scheme = appearance.scheme;
	});
</script>

<GlassShell class="[--sidebar-width:260px]">
	<Sidebar />
	<main class="glass-content">
		<header class="drag-region flex h-[60px] flex-none items-center justify-between gap-4 pr-4 pl-8">
			<h1 class="truncate text-[20px] font-semibold">{disks.drive?.name ?? 'Disks'}</h1>
			<WindowControls />
		</header>
		<div class="soft-scroll min-h-0 flex-1 overflow-y-auto">
			<div class="mx-auto flex w-full max-w-[820px] flex-col gap-7 px-8 pt-2 pb-10">
				{#if disks.drive}
					{#key disks.drive.id}
						<DriveView drive={disks.drive} />
					{/key}
				{/if}
			</div>
		</div>
	</main>
	<Notice />
	<DialogHost />
</GlassShell>
