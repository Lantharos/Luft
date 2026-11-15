<script lang="ts">
	import { t } from '@luft/i18n';
	import { ContextMenu, MenuItem, MenuSeparator } from '@luft/ui';
	import type { ThreadRow } from '#lib/bindings.js';
	import * as actions from '#lib/mail/actions.js';
	import { list } from '#lib/mail/list.svelte.js';
	import { mail } from '#lib/mail/mail.svelte.js';

	interface Props {
		row: ThreadRow;
		at: { x: number; y: number };
		onclose: () => void;
	}

	let { row, at, onclose }: Props = $props();

	let threads = $derived(list.chosen.has(row.thread) ? [...list.chosen] : [row.thread]);
	let folders = $derived(mail.mailboxes.filter((mailbox) => mailbox.account === row.account && mailbox.selectable && !mailbox.role));

	function run(action: () => void) {
		onclose();
		action();
	}
</script>

<svelte:window onpointerdown={onclose} onkeydown={(event) => event.key === 'Escape' && onclose()} />

<ContextMenu {at} {onclose}>
	{#if list.view !== 'inbox'}
		<MenuItem onclick={() => run(() => actions.move('inbox', threads))}>{t('mailman-menu-move-to-inbox')}</MenuItem>
	{/if}
	{#if list.view !== 'archive'}
		<MenuItem onclick={() => run(() => actions.move('archive', threads))}>{t('mailman-menu-archive')}</MenuItem>
	{/if}
	<MenuItem onclick={() => run(() => void actions.setRead(threads, row.unread > 0))}>{row.unread > 0 ? t('mailman-menu-mark-read') : t('mailman-menu-mark-unread')}</MenuItem>
	<MenuItem onclick={() => run(() => void actions.setStar(threads, !row.flagged))}>{row.flagged ? t('mailman-menu-remove-star') : t('mailman-menu-star')}</MenuItem>
	{#if row.snoozedUntil}
		<MenuItem onclick={() => run(() => void actions.wake(threads))}>{t('mailman-menu-back-now')}</MenuItem>
	{/if}
	<MenuSeparator />
	{#each folders as folder (folder.id)}
		<MenuItem onclick={() => run(() => actions.moveTo(folder.id, threads))}>{t('mailman-menu-move-to', { folder: folder.name })}</MenuItem>
	{/each}
	<MenuItem onclick={() => run(() => actions.move('spam', threads))}>{t('mailman-menu-junk')}</MenuItem>
	<MenuItem onclick={() => run(() => void actions.screen(row.sender, 'denied', threads))}>{t('mailman-menu-screen-out', { sender: row.senderName || row.sender })}</MenuItem>
	<MenuSeparator />
	<MenuItem danger onclick={() => run(() => actions.move(list.view === 'trash' ? 'deleteForever' : 'trash', threads))}>
		{list.view === 'trash' ? t('mailman-menu-delete-forever') : t('mailman-menu-delete')}
	</MenuItem>
</ContextMenu>
