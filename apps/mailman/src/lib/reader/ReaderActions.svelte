<script lang="ts">
	import { MenuButton, MenuItem, MenuSeparator, tooltip } from '@luft/ui';
	import Archive from '@lucide/svelte/icons/archive';
	import Clock from '@lucide/svelte/icons/clock';
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import Inbox from '@lucide/svelte/icons/inbox';
	import Mail from '@lucide/svelte/icons/mail';
	import Star from '@lucide/svelte/icons/star';
	import Trash from '@lucide/svelte/icons/trash-2';
	import * as actions from '$lib/mail/actions';
	import { list } from '$lib/mail/list.svelte';
	import { mail } from '$lib/mail/mail.svelte';
	import LaterPopover from '$lib/shell/LaterPopover.svelte';
	import { reader } from './reader.svelte';

	let thread = $derived(reader.thread);
	let latest = $derived(reader.latest);
	let starred = $derived(reader.messages.some((message) => message.flagged));
	let inInbox = $derived(reader.messages.some((message) => message.role === 'inbox'));
	let folders = $derived(latest ? mail.folders(latest.account) : []);
	let laterAnchor = $state<HTMLElement | null>(null);

	export function later(anchor: HTMLElement | null = null) {
		laterAnchor = anchor ?? document.querySelector<HTMLElement>('[data-later]');
	}
</script>

{#if thread !== null}
	{#if inInbox}
		<button type="button" class="icon-button" aria-label="Archive" onclick={() => actions.move('archive', [thread])} {@attach tooltip('Archive (E)')}>
			<Archive size={18} />
		</button>
	{:else}
		<button type="button" class="icon-button" aria-label="Move to Inbox" onclick={() => actions.move('inbox', [thread])} {@attach tooltip('Move to Inbox')}>
			<Inbox size={18} />
		</button>
	{/if}
	<button type="button" class="icon-button" aria-label="Delete" onclick={() => actions.move(list.view === 'trash' ? 'deleteForever' : 'trash', [thread])} {@attach tooltip('Delete (#)')}>
		<Trash size={18} />
	</button>
	<button type="button" class="icon-button" data-later aria-label="Later" onclick={(event) => later(event.currentTarget)} {@attach tooltip('Later (B)')}>
		<Clock size={18} />
	</button>
	<button type="button" class="icon-button" class:starred aria-label={starred ? 'Remove star' : 'Star'} onclick={() => void actions.setStar([thread], !starred)} {@attach tooltip('Star (S)')}>
		<Star size={18} />
	</button>
	<button type="button" class="icon-button" aria-label="Mark as unread" onclick={() => void actions.setRead([thread], false)} {@attach tooltip('Mark as unread (Shift+U)')}>
		<Mail size={18} />
	</button>
	<MenuButton label="More" class="icon-button" align="end">
		{#snippet trigger()}<Ellipsis size={18} />{/snippet}
		{#snippet children(close)}
			{#each folders as folder (folder.id)}
				<MenuItem onclick={() => (close(), actions.moveTo(folder.id, [thread]))}>Move to {folder.name}</MenuItem>
			{/each}
			{#if folders.length}<MenuSeparator />{/if}
			<MenuItem onclick={() => (close(), actions.move('spam', [thread]))}>Report junk</MenuItem>
			{#if latest}
				<MenuItem onclick={() => (close(), void actions.screen(latest.sender, 'denied', [thread]))}>Screen out {latest.senderName || latest.sender}</MenuItem>
			{/if}
			<MenuItem onclick={() => (close(), reader.expandAll())}>Expand all</MenuItem>
		{/snippet}
	</MenuButton>
{/if}

{#if laterAnchor && thread !== null}
	<LaterPopover anchor={laterAnchor} onpick={(at) => actions.snooze(at, [thread])} onclose={() => (laterAnchor = null)} />
{/if}

<style>
	.starred {
		color: var(--accent);
	}

	.starred :global(svg) {
		fill: currentColor;
	}
</style>
