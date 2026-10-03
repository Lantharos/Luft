<script lang="ts">
	import { MenuButton, MenuItem, MenuSeparator, tooltip } from '@luft/ui';
	import Archive from '@lucide/svelte/icons/archive';
	import Clock from '@lucide/svelte/icons/clock';
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import Inbox from '@lucide/svelte/icons/inbox';
	import Mail from '@lucide/svelte/icons/mail';
	import Star from '@lucide/svelte/icons/star';
	import Trash from '@lucide/svelte/icons/trash-2';
	import * as actions from '#lib/mail/actions.js';
	import { list } from '#lib/mail/list.svelte.js';
	import { mail } from '#lib/mail/mail.svelte.js';
	import LaterPopover from '#lib/shell/LaterPopover.svelte';
	import { reader } from './reader.svelte';

	let threads = $derived(list.chosen.size ? [...list.chosen] : reader.thread !== null ? [reader.thread] : []);
	let bulk = $derived(list.chosen.size > 0);
	let latest = $derived(bulk ? null : reader.latest);
	let rows = $derived(list.rows.filter((row) => threads.includes(row.thread)));
	let starred = $derived(bulk ? rows.every((row) => row.flagged) : reader.messages.some((message) => message.flagged));
	let archivable = $derived(list.view !== 'archive' && (bulk || reader.messages.some((message) => message.role === 'inbox')));
	let account = $derived(latest?.account ?? rows[0]?.account ?? null);
	let folders = $derived(account === null || rows.some((row) => row.account !== account) ? [] : mail.folders(account));
	let laterAnchor = $state<HTMLElement | null>(null);

	export function later(anchor: HTMLElement | null = null) {
		laterAnchor = anchor ?? document.querySelector<HTMLElement>('[data-later]');
	}
</script>

{#if threads.length}
	{#if archivable}
		<button type="button" class="icon-button" aria-label="Archive" onclick={() => actions.move('archive', threads)} {@attach tooltip('Archive (E)')}>
			<Archive size={18} />
		</button>
	{:else}
		<button type="button" class="icon-button" aria-label="Move to Inbox" onclick={() => actions.move('inbox', threads)} {@attach tooltip('Move to Inbox')}>
			<Inbox size={18} />
		</button>
	{/if}
	<button type="button" class="icon-button" aria-label="Delete" onclick={() => actions.move(list.view === 'trash' ? 'deleteForever' : 'trash', threads)} {@attach tooltip('Delete (#)')}>
		<Trash size={18} />
	</button>
	<button type="button" class="icon-button" data-later aria-label="Later" onclick={(event) => later(event.currentTarget)} {@attach tooltip('Later (B)')}>
		<Clock size={18} />
	</button>
	<button type="button" class="icon-button" class:starred aria-label={starred ? 'Remove star' : 'Star'} onclick={() => void actions.setStar(threads, !starred)} {@attach tooltip('Star (S)')}>
		<Star size={18} />
	</button>
	<button type="button" class="icon-button" aria-label="Mark as unread" onclick={() => void actions.setRead(threads, false)} {@attach tooltip('Mark as unread (Shift+U)')}>
		<Mail size={18} />
	</button>
	<MenuButton label="More" class="icon-button" align="end">
		{#snippet trigger()}<Ellipsis size={18} />{/snippet}
		{#snippet children(close)}
			{#each folders as folder (folder.id)}
				<MenuItem onclick={() => (close(), actions.moveTo(folder.id, threads))}>Move to {folder.name}</MenuItem>
			{/each}
			{#if folders.length}<MenuSeparator />{/if}
			{#if bulk}
				<MenuItem onclick={() => (close(), void actions.setRead(threads, true))}>Mark as read</MenuItem>
			{/if}
			<MenuItem onclick={() => (close(), actions.move('spam', threads))}>Report junk</MenuItem>
			{#if latest}
				<MenuItem onclick={() => (close(), void actions.screen(latest.sender, 'denied', threads))}>Screen out {latest.senderName || latest.sender}</MenuItem>
				<MenuItem onclick={() => (close(), reader.expandAll())}>Expand all</MenuItem>
			{/if}
		{/snippet}
	</MenuButton>
{/if}

{#if laterAnchor && threads.length}
	<LaterPopover anchor={laterAnchor} onpick={(at) => actions.snooze(at, threads)} onclose={() => (laterAnchor = null)} />
{/if}

<style>
	.starred {
		color: var(--accent);
	}

	.starred :global(svg) {
		fill: currentColor;
	}
</style>
