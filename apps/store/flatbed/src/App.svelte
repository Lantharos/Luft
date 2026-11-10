<script lang="ts">
	import { onMount } from 'svelte';
	import { i18n, t } from '@luft/i18n';
	import { appearance, ConfirmDialog, errorText, fileDrop, GlassShell, Toast } from '@luft/ui';
	import { commands, type PageView } from '#lib/bindings.js';
	import { flatbed } from '#lib/app/flatbed.svelte.js';
	import AddScannerDialog from '#lib/dialogs/AddScannerDialog.svelte';
	import CameraDialog from '#lib/dialogs/CameraDialog.svelte';
	import CornersDialog from '#lib/dialogs/CornersDialog.svelte';
	import IdentityDialog from '#lib/dialogs/IdentityDialog.svelte';
	import SaveDialog from '#lib/dialogs/SaveDialog.svelte';
	import SettingsDialog from '#lib/dialogs/SettingsDialog.svelte';
	import PageGrid from '#lib/pages/PageGrid.svelte';
	import Header from '#lib/shell/Header.svelte';
	import ScanBar from '#lib/shell/ScanBar.svelte';
	import Sidebar from '#lib/shell/Sidebar.svelte';
	import Welcome from '#lib/shell/Welcome.svelte';

	type Open = { kind: 'camera' } | { kind: 'save' } | { kind: 'settings' } | { kind: 'add' } | { kind: 'clear' } | { kind: 'corners'; page: PageView };

	let ready = $state(false);
	let failure = $state('');
	let open = $state<Open | null>(null);
	const close = () => (open = null);

	onMount(() => {
		let stop = () => {};
		void (async () => {
			try {
				const state = await commands.appState();
				appearance.start(state);
				stop = flatbed.start(state);
				await i18n.ready;
				ready = true;
			} catch (error) {
				failure = errorText(error);
			}
		})();
		return () => stop();
	});

	$effect(() => {
		document.documentElement.dataset.scheme = appearance.scheme;
	});

	const drop = fileDrop((paths) => void flatbed.importPictures(paths));
</script>

<svelte:window ondragover={drop.ondragover} ondrop={drop.ondrop} />

<div class="h-[100dvh] w-screen overflow-hidden">
	<GlassShell class="h-full select-none">
		<Sidebar onadd={() => (open = { kind: 'add' })} onsettings={() => (open = { kind: 'settings' })} />
		<main class="glass-content relative flex flex-col">
			<Header onsave={() => (open = { kind: 'save' })} onclear={() => (open = { kind: 'clear' })} />
			{#if failure}
				<p class="m-auto max-w-[420px] text-center text-[14px] text-[var(--text-soft)]">{t('start-failed', { reason: failure })}</p>
			{:else if ready}
				<div class="soft-scroll min-h-0 flex-1 overflow-y-auto">
					{#if flatbed.pages.length || flatbed.scanning}
						<PageGrid onopen={(page) => (open = { kind: 'corners', page })} />
					{:else}
						<Welcome />
					{/if}
				</div>
				<div class="pointer-events-none absolute inset-x-0 bottom-5 flex justify-center">
					<div class="pointer-events-auto"><ScanBar oncamera={() => (open = { kind: 'camera' })} /></div>
				</div>
			{/if}
			<Toast
				class="absolute z-40"
				toast={flatbed.toasts.current}
				ondismiss={flatbed.toasts.dismiss}
				onhold={flatbed.toasts.hold}
				onrelease={flatbed.toasts.release}
			/>
		</main>
	</GlassShell>
</div>

{#if flatbed.changed}
	<IdentityDialog scanner={flatbed.changed} />
{/if}

{#if open?.kind === 'camera'}
	<CameraDialog onclose={close} />
{:else if open?.kind === 'save'}
	<SaveDialog onclose={close} />
{:else if open?.kind === 'settings'}
	<SettingsDialog onclose={close} />
{:else if open?.kind === 'add'}
	<AddScannerDialog onclose={close} />
{:else if open?.kind === 'corners'}
	<CornersDialog page={open.page} onclose={close} />
{:else if open?.kind === 'clear'}
	<ConfirmDialog
		title={t('clear-title')}
		description={t('clear-description', { count: flatbed.pages.length })}
		action={t('clear-confirm')}
		danger
		run={async () => {
			await commands.documentClear();
		}}
		onclose={close}
	/>
{/if}
