<script lang="ts">
	import { onMount } from 'svelte';
	import { isAvailable } from '@lantharos/sabine';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { appearance, GlassShell, WindowControls } from '@luft/ui';
	import DriveView from '#lib/components/drive/DriveView.svelte';
	import EditorActions from '#lib/components/editor/EditorActions.svelte';
	import EditorView from '#lib/components/editor/EditorView.svelte';
	import SpaceView from '#lib/components/space/SpaceView.svelte';
	import Notice from '#lib/components/Notice.svelte';
	import Sidebar from '#lib/components/Sidebar.svelte';
	import DialogHost from '#lib/dialogs/DialogHost.svelte';
	import { dialogs } from '#lib/dialogs/dialogs.svelte.js';
	import { editor } from '#lib/editor/editor.svelte.js';
	import { disks } from '#lib/state/disks.svelte.js';
	import { space } from '#lib/state/space.svelte.js';

	onMount(() => {
		if (isAvailable()) void disks.start();
	});

	$effect(() => {
		document.documentElement.dataset.scheme = appearance.scheme;
	});

	let editing = $derived(!space.root && editor.active ? editor.layout : null);
	let title = $derived(space.root ? space.title : editing ? `Partitions on ${disks.drive?.name}` : (disks.drive?.name ?? 'Disks'));

	function back() {
		if (space.root) space.up();
		else if (editor.steps.length) dialogs.open({ kind: 'discard-plan' });
		else editor.close();
	}
</script>

<GlassShell class="[--sidebar-width:260px]">
	<Sidebar />
	<main class="glass-content">
		<header class="drag-region flex h-[60px] flex-none items-center gap-2 pr-4 pl-8">
			{#if space.root || editing}
				<button type="button" class="icon-button -ml-2" aria-label="Back" disabled={editor.running} onclick={back}><ArrowLeft size={18} /></button>
			{/if}
			<h1 class="min-w-0 flex-1 truncate text-[20px] font-semibold">{title}</h1>
			{#if editing}
				<EditorActions />
			{/if}
			<WindowControls />
		</header>
		<div class="soft-scroll min-h-0 flex-1 overflow-y-auto">
			<div class="mx-auto flex w-full max-w-[820px] flex-col gap-7 px-8 pt-2 pb-10">
				{#if space.root}
					<SpaceView />
				{:else if editing && disks.drive}
					<EditorView drive={disks.drive} layout={editing} />
				{:else if disks.drive}
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
