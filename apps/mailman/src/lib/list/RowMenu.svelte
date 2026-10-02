<script lang="ts">
	import { ContextMenu, MenuItem, MenuSeparator } from '@luft/ui';
	import type { ThreadRow } from '$lib/api';
	import * as actions from '$lib/mail/actions';
	import { list } from '$lib/mail/list.svelte';
	import { mail } from '$lib/mail/mail.svelte';

	interface Props {
		row: ThreadRow;
		at: { x: number; y: number };
		onclose: () => void;
	}

	let { row, at, onclose }: Props = $props();

	let threads = $derived([row.thread]);
	let folders = $derived(mail.mailboxes.filter((mailbox) => mailbox.account === row.account && mailbox.selectable && !mailbox.role));

	function run(action: () => void) {
		onclose();
		action();
	}
</script>

<svelte:window onpointerdown={onclose} onkeydown={(event) => event.key === 'Escape' && onclose()} />

<ContextMenu {at} {onclose}>
	{#if list.view !== 'inbox'}
		<MenuItem onclick={() => run(() => actions.move('inbox', threads))}>Move to Inbox</MenuItem>
	{/if}
	{#if list.view !== 'archive'}
		<MenuItem onclick={() => run(() => actions.move('archive', threads))}>Archive</MenuItem>
	{/if}
	<MenuItem onclick={() => run(() => void actions.setRead(threads, row.unread > 0))}>{row.unread > 0 ? 'Mark as read' : 'Mark as unread'}</MenuItem>
	<MenuItem onclick={() => run(() => void actions.setStar(threads, !row.flagged))}>{row.flagged ? 'Remove star' : 'Star'}</MenuItem>
	{#if row.snoozedUntil}
		<MenuItem onclick={() => run(() => void actions.wake(threads))}>Back to Inbox now</MenuItem>
	{/if}
	<MenuSeparator />
	{#each folders as folder (folder.id)}
		<MenuItem onclick={() => run(() => actions.moveTo(folder.id, threads))}>Move to {folder.name}</MenuItem>
	{/each}
	<MenuItem onclick={() => run(() => actions.move('spam', threads))}>Report junk</MenuItem>
	<MenuItem onclick={() => run(() => void actions.screen(row.sender, 'denied', threads))}>Screen out {row.senderName || row.sender}</MenuItem>
	<MenuSeparator />
	<MenuItem danger onclick={() => run(() => actions.move(list.view === 'trash' ? 'deleteForever' : 'trash', threads))}>
		{list.view === 'trash' ? 'Delete forever' : 'Delete'}
	</MenuItem>
</ContextMenu>
