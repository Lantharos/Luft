<script lang="ts">
	import { appWindow } from '@lantharos/sabine';
	import { onMount } from 'svelte';
	import { appearance, DialogWindow } from '@luft/ui';
	import { describe } from '#lib/app/permissions.js';
	import { commands, type DialogState } from '#lib/bindings.js';
	import FlathubConsent from '#lib/components/FlathubConsent.svelte';
	import OpenFailedDialog from '#lib/components/OpenFailedDialog.svelte';
	import RemoveDialog from '#lib/components/RemoveDialog.svelte';
	import { FileInstall } from '#lib/files/install.svelte.js';
	import StoreConsent from '#lib/pages/app/StoreConsent.svelte';
	import { startDialog } from '../start.js';
	import ConsentFor from './ConsentFor.svelte';
	import DetailsDialog from './DetailsDialog.svelte';

	let { dialog }: { dialog: number } = $props();

	let shownState = $state<DialogState | null>(null);
	let install = $state<FileInstall | null>(null);

	const close = () => void appWindow.close();

	async function answer(value: boolean) {
		await commands.installDialogAnswer({ dialog, answer: value });
		close();
	}

	function show(started: DialogState) {
		if (started.dialog.kind === 'details') {
			install = new FileInstall(started.path, async () => null);
			install.file = started.dialog.file;
		}
		shownState = started;
	}

	onMount(() => {
		void startDialog(dialog).then(show, close);
	});

	$effect(() => {
		document.documentElement.dataset.scheme = appearance.scheme;
	});
</script>

<DialogWindow>
	{#if shownState}
		{@const shown = shownState.dialog}
		{#if install}
			<DetailsDialog {install} onclose={close} />
		{:else if shown.kind === 'consent'}
			<ConsentFor consent={shown.consent} file={shown.file} onconfirm={() => answer(true)} onclose={close} />
		{:else if shown.kind === 'store'}
			<StoreConsent store={shown.store} onconfirm={answer} onclose={close} />
		{:else if shown.kind === 'flathub'}
			<FlathubConsent name={shown.name} access={describe(shown.permissions)} onconfirm={() => answer(true)} onclose={close} />
		{:else if shown.kind === 'remove'}
			<RemoveDialog app={shown.app} onclose={close} />
		{:else if shown.kind === 'openFailed'}
			<OpenFailedDialog failed={shown.failed} onclose={close} />
		{/if}
	{/if}
</DialogWindow>
