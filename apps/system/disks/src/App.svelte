<script lang="ts">
	import { t } from '@luft/i18n';
	import { onMount } from 'svelte';
	import { appWindow } from '@lantharos/sabine';
	import ChevronLeft from '@luft/symbols/icons/chevron-left';
	import { appearance, GlassShell, IconButton, PageStage, TitleBar, Toast } from '@luft/ui';
	import { events } from '#lib/bindings.js';
	import DriveView from '#lib/components/drive/DriveView.svelte';
	import EditorActions from '#lib/components/editor/EditorActions.svelte';
	import EditorView from '#lib/components/editor/EditorView.svelte';
	import SpaceView from '#lib/components/space/SpaceView.svelte';
	import Sidebar from '#lib/components/Sidebar.svelte';
	import DialogHost from '#lib/dialogs/DialogHost.svelte';
	import { dialogs } from '#lib/dialogs/dialogs.svelte.js';
	import { editor } from '#lib/editor/editor.svelte.js';
	import { disks } from '#lib/state/disks.svelte.js';
	import { space } from '#lib/state/space.svelte.js';

	onMount(() => {
		void disks.start();
		return events.disksCloseAsked(close);
	});

	$effect(() => {
		document.documentElement.dataset.scheme = appearance.scheme;
	});

	let editing = $derived(!space.root && editor.active ? editor.layout : null);
	let title = $derived(space.root ? space.title : editing ? t('disks-editor-title', { drive: disks.drive?.name ?? '' }) : (disks.drive?.name ?? 'Disks'));

	let page = $derived(space.root ? 'space' : editing ? 'editor' : disks.drive?.id);
	let order = $derived(disks.drives.findIndex((drive) => drive.id === disks.drive?.id));

	let working = $derived(editor.running || disks.busy.size > 0 || (disks.image !== null && !disks.image.finished));

	function close() {
		if (working) dialogs.open({ kind: 'still-working' });
		else appWindow.close();
	}

	function back() {
		if (space.root) space.up();
		else if (editor.steps.length) dialogs.open({ kind: 'discard-plan' });
		else editor.close();
	}
</script>

{#snippet backButton()}
	<IconButton icon={ChevronLeft} label={t('disks-back')} large disabled={editor.running} onclick={back} />
{/snippet}

{#snippet editorActions()}
	<EditorActions />
{/snippet}

<GlassShell class="[--sidebar-width:260px]">
	<Sidebar />
	<main class="glass-content">
		<TitleBar {title} onclose={close} leading={space.root || editing ? backButton : undefined} actions={editing ? editorActions : undefined} />
		<PageStage {page} {order} depth={space.root || editing ? 1 : 0} class="mx-auto w-full max-w-[820px] gap-7 px-8 pt-2 pb-10">
			{#if space.root}
				<SpaceView />
			{:else if editing && disks.drive}
				<EditorView drive={disks.drive} layout={editing} />
			{:else if disks.drive}
				<DriveView drive={disks.drive} />
			{/if}
		</PageStage>
	</main>
	<Toast
		toast={disks.notices.current}
		dismissible
		ondismiss={disks.notices.dismiss}
		onhold={disks.notices.hold}
		onrelease={disks.notices.release}
	/>
	<DialogHost />
</GlassShell>
