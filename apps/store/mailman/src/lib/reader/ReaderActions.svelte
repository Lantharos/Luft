<script lang="ts">
	import { t } from '@luft/i18n';
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
		<button type="button" class="icon-button" aria-label={t('mailman-list-archive')} onclick={() => actions.move('archive', threads)} {@attach tooltip(t('mailman-list-archive-tooltip'))}>
			<Archive size={18} />
		</button>
	{:else}
		<button type="button" class="icon-button" aria-label={t('mailman-actions-move-to-inbox')} onclick={() => actions.move('inbox', threads)} {@attach tooltip(t('mailman-actions-move-to-inbox'))}>
			<Inbox size={18} />
		</button>
	{/if}
	<button type="button" class="icon-button" aria-label={t('mailman-list-delete')} onclick={() => actions.move(list.view === 'trash' ? 'deleteForever' : 'trash', threads)} {@attach tooltip(t('mailman-list-delete-tooltip'))}>
		<Trash size={18} />
	</button>
	<button type="button" class="icon-button" data-later aria-label={t('mailman-list-later')} onclick={(event) => later(event.currentTarget)} {@attach tooltip(t('mailman-list-later-tooltip'))}>
		<Clock size={18} />
	</button>
	<button type="button" class="icon-button" class:starred aria-label={starred ? t('mailman-actions-remove-star') : t('mailman-actions-star')} onclick={() => void actions.setStar(threads, !starred)} {@attach tooltip(t('mailman-actions-star-tooltip'))}>
		<Star size={18} />
	</button>
	<button type="button" class="icon-button" aria-label={t('mailman-actions-mark-unread')} onclick={() => void actions.setRead(threads, false)} {@attach tooltip(t('mailman-actions-mark-unread-tooltip'))}>
		<Mail size={18} />
	</button>
	<MenuButton label={t('mailman-menu-more')} class="icon-button" align="end">
		{#snippet trigger()}<Ellipsis size={18} />{/snippet}
		{#snippet children(close)}
			{#each folders as folder (folder.id)}
				<MenuItem onclick={() => (close(), actions.moveTo(folder.id, threads))}>{t('mailman-menu-move-to', { folder: folder.name })}</MenuItem>
			{/each}
			{#if folders.length}<MenuSeparator />{/if}
			{#if bulk}
				<MenuItem onclick={() => (close(), void actions.setRead(threads, true))}>{t('mailman-menu-mark-read')}</MenuItem>
			{/if}
			<MenuItem onclick={() => (close(), actions.move('spam', threads))}>{t('mailman-menu-junk')}</MenuItem>
			{#if latest}
				<MenuItem onclick={() => (close(), void actions.screen(latest.sender, 'denied', threads))}>{t('mailman-menu-screen-out', { sender: latest.senderName || latest.sender })}</MenuItem>
				<MenuItem onclick={() => (close(), reader.expandAll())}>{t('mailman-menu-expand-all')}</MenuItem>
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
