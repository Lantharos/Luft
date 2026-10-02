<script lang="ts">
	import { onMount } from 'svelte';
	import { appWindow, events as sabineEvents, type WindowFileDragEvent } from '@lantharos/sabine';
	import { appearance, GlassShell, tooltip } from '@luft/ui';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import * as api from '$lib/api';
	import { commands, WIDE_WINDOW, type Shell } from '$lib/app/commands';
	import { plural } from '$lib/app/format';
	import { handleKeydown } from '$lib/app/keyboard';
	import { opened } from '$lib/app/launch.svelte';
	import { navigate, openThread } from '$lib/app/navigation';
	import Composer from '$lib/compose/Composer.svelte';
	import { composer } from '$lib/compose/composer.svelte';
	import ThreadList from '$lib/list/ThreadList.svelte';
	import { refreshAll } from '$lib/mail/actions';
	import { list } from '$lib/mail/list.svelte';
	import { mail } from '$lib/mail/mail.svelte';
	import { viewLabel } from '$lib/mail/views';
	import CommandPalette from '$lib/palette/CommandPalette.svelte';
	import MessageFile from '$lib/reader/MessageFile.svelte';
	import Reader from '$lib/reader/Reader.svelte';
	import ReaderActions from '$lib/reader/ReaderActions.svelte';
	import ReaderEmpty from '$lib/reader/ReaderEmpty.svelte';
	import { reader } from '$lib/reader/reader.svelte';
	import { remoteImages } from '$lib/reader/images.svelte';
	import AddAccount from '$lib/settings/AddAccount.svelte';
	import SettingsDialog from '$lib/settings/SettingsDialog.svelte';
	import Shortcuts from '$lib/shell/Shortcuts.svelte';
	import Toast from '$lib/shell/Toast.svelte';
	import { toasts } from '$lib/shell/toasts.svelte';
	import Header from '$lib/shell/Header.svelte';
	import Welcome from '$lib/shell/Welcome.svelte';
	import Sidebar from '$lib/sidebar/Sidebar.svelte';

	const LIST_WIDTH = 408;
	const REFRESH_DELAY = 200;

	let width = $state(window.innerWidth);
	let sidebar = $state<Sidebar>();
	let readerActions = $state<ReaderActions>();
	let palette = $state(false);
	let settings = $state(false);
	let adding = $state(false);
	let shortcuts = $state(false);
	let refreshTimer: ReturnType<typeof setTimeout> | undefined;

	let wide = $derived(width >= WIDE_WINDOW);
	let showList = $derived(wide || reader.thread === null);
	let showReader = $derived(wide || reader.thread !== null);
	let title = $derived(list.searching ? 'Search' : viewLabel(list.view, mail.mailboxes));
	let subtitle = $derived.by(() => {
		if (list.searching) return plural(list.total, 'result', 'results');
		const unread = list.rows.filter((row) => row.unread > 0).length;
		if (list.view === 'inbox' && unread) return plural(unread, 'unread', 'unread');
		return list.total ? plural(list.total, 'conversation', 'conversations') : null;
	});

	const shell: Shell = {
		focusSearch: () => sidebar?.focusSearch(),
		openSettings: () => (settings = true),
		addAccount: () => (adding = true),
		later: () => readerActions?.later(),
		showShortcuts: () => (shortcuts = true)
	};

	$effect(() => {
		document.documentElement.dataset.scheme = appearance.scheme;
	});

	onMount(() => {
		const stops = [
			api.events.changed(scheduleRefresh),
			api.events.status(mail.receiveStatus),
			api.events.body(reader.receive),
			api.events.images(remoteImages.receive),
			api.events.open(({ thread, token }) => {
				appWindow.focus(token ?? undefined);
				opened.close();
				if (thread === null) return navigate('inbox');
				void openThread(thread);
			}),
			api.events.outbox(({ error }) => {
				if (error) toasts.show(`Couldn't send: ${error}. Mailman will try again.`, { failed: true });
			}),
			api.events.activation((activation) => void api.resolveArguments(activation).then((launches) => opened.handle(launches, false))),
			api.isDesktop() ? sabineEvents.fileDrag(drop) : () => {}
		];
		void start();
		return () => stops.forEach((stop) => stop());
	});

	async function start() {
		const state = await api.appState();
		appearance.start(state);
		mail.start(state);
		opened.handle(state.launch, true);
		await list.open('inbox');
	}

	function scheduleRefresh() {
		clearTimeout(refreshTimer);
		refreshTimer = setTimeout(() => void refreshAll(), REFRESH_DELAY);
	}

	function drop(event: WindowFileDragEvent) {
		if (event.phase !== 'drop' || event.internal) return;
		const messages = event.paths.filter((path) => path.toLowerCase().endsWith('.eml'));
		if (composer.current) {
			composer.current.attachments = [...composer.current.attachments, ...event.paths.map((path) => ({ path, name: path.split('/').pop() ?? path, cid: null, size: 0 }))];
		} else if (messages.length) {
			opened.file = messages[0];
		}
	}

	function search(query: string) {
		void list.search(query);
	}
</script>

<svelte:window
	bind:innerWidth={width}
	onkeydown={(event) => handleKeydown(event, { commands: () => commands(shell), palette: () => (palette = true) })}
	onfocus={() => void api.setFocused(true)}
	onblur={() => void api.setFocused(false)}
/>

<div class="h-[100dvh] w-screen overflow-hidden">
	<GlassShell class="h-full select-none [--sidebar-width:248px]">
		{#if !opened.focused}
			<Sidebar bind:this={sidebar} onsettings={() => (settings = true)} />
		{/if}
		<main class="glass-content relative isolate">
			{#if opened.file}
				<Header title="Message" subtitle={opened.file.split('/').pop()}>
					{#snippet leading()}
						{#if !opened.focused}
							<button type="button" class="icon-button" aria-label="Back to mail" onclick={() => opened.close()} {@attach tooltip('Back to mail')}><ArrowLeft size={18} /></button>
						{/if}
					{/snippet}
				</Header>
				<MessageFile path={opened.file} />
			{:else}
				<Header {title} {subtitle} width={wide && mail.accounts.length ? LIST_WIDTH : null}>
					{#snippet leading()}
						{#if !wide && reader.thread !== null}
							<button type="button" class="icon-button" aria-label="Back" onclick={() => reader.close()} {@attach tooltip('Back (Esc)')}><ArrowLeft size={18} /></button>
						{/if}
					{/snippet}
					{#snippet actions()}
						<ReaderActions bind:this={readerActions} />
					{/snippet}
				</Header>
				<div class="flex min-h-0 flex-1">
					{#if !mail.ready}
						<div class="flex-1"></div>
					{:else if !mail.accounts.length}
						<Welcome onadd={() => (adding = true)} />
					{:else}
						{#if showList}
							<div class="flex min-h-0 flex-col" class:flex-1={!wide} style:width={wide ? `${LIST_WIDTH}px` : undefined}>
								<ThreadList />
							</div>
						{/if}
						{#if showReader}
							<div class="flex min-h-0 min-w-0 flex-1 flex-col">
								{#if reader.thread !== null && reader.messages.length}
									<Reader />
								{:else}
									<ReaderEmpty />
								{/if}
							</div>
						{/if}
					{/if}
				</div>
			{/if}
		</main>
		{#if composer.current}
			<Composer bind:composition={composer.current} />
		{/if}
		<Toast />
	</GlassShell>
</div>

{#if palette}
	<CommandPalette commands={commands(shell)} onsearch={search} onclose={() => (palette = false)} />
{/if}
{#if settings}
	<SettingsDialog onclose={() => (settings = false)} onadd={() => ((settings = false), (adding = true))} />
{/if}
{#if adding}
	<AddAccount onclose={() => (adding = false)} />
{/if}
{#if shortcuts}
	<Shortcuts commands={commands(shell)} onclose={() => (shortcuts = false)} />
{/if}
