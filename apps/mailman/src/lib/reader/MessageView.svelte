<script lang="ts">
	import { Avatar, tooltip } from '@luft/ui';
	import ImageOff from '@lucide/svelte/icons/image-off';
	import Reply from '@lucide/svelte/icons/reply';
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import * as api from '#lib/api/index.js';
	import type { Address, Message } from '#lib/api/index.js';
	import { longDate, shortDate } from '#lib/app/format.js';
	import { composer } from '#lib/compose/composer.svelte.js';
	import { mail } from '#lib/mail/mail.svelte.js';
	import Attachments from './Attachments.svelte';
	import MailBody from './MailBody.svelte';
	import { reader } from './reader.svelte';

	interface Props {
		message: Message;
		expanded: boolean;
	}

	let { message, expanded }: Props = $props();

	let rendered = $derived(reader.bodies.get(message.id) ?? null);
	let failure = $derived(reader.failures.get(message.id) ?? null);
	let name = $derived(message.senderName || message.sender);
	let quotes = $state(0);
	let showQuotes = $state(false);
	let images = $state(false);
	let remembered = $state(false);

	let own = $derived(new Set(mail.accounts.map((account) => account.email)));
	let recipients = $derived([...message.recipients.to, ...message.recipients.cc]);

	$effect(() => {
		const sender = message.sender;
		void api.imagesAllowed(sender).then((allowed) => {
			remembered = allowed;
			images = allowed;
		});
	});

	function label(address: Address) {
		return own.has(address.address) ? 'me' : address.name || address.address;
	}

	async function always() {
		images = true;
		remembered = true;
		await api.allowImages(message.sender, true);
	}
</script>

{#if expanded}
	<article class="message">
		<header class="flex items-start gap-3">
			<Avatar picture={null} name={name} size={36} />
			<div class="min-w-0 flex-1">
				<div class="flex items-baseline gap-2">
					<span class="truncate text-[14px] font-semibold">{name}</span>
					<span class="min-w-0 truncate text-[12.5px] text-[var(--text-muted)]">{message.sender}</span>
				</div>
				<p class="truncate text-[12.5px] text-[var(--text-muted)]">
					to {recipients.map(label).join(', ') || 'undisclosed recipients'}
				</p>
			</div>
			<span class="flex-none pt-0.5 text-[12.5px] text-[var(--text-muted)]" {@attach tooltip(longDate(message.date))}>{shortDate(message.date)}</span>
			{#if message.draft}
				<button type="button" class="plain-button edit" onclick={() => void composer.reopen(message.id)}>Continue writing</button>
			{:else}
				<button type="button" class="icon-button reply" aria-label="Reply" onclick={() => composer.reply(message, rendered, false)} {@attach tooltip('Reply (R)')}>
					<Reply size={16} />
				</button>
			{/if}
		</header>
		{#if rendered && rendered.remote.length && !images}
			<div class="notice">
				<ImageOff size={15} class="flex-none" />
				<span class="min-w-0 flex-1 truncate">
					Pictures are hidden{rendered.trackers ? `, ${rendered.trackers === 1 ? 'a tracker' : `${rendered.trackers} trackers`} blocked` : ''}
				</span>
				<button type="button" class="plain-button small" onclick={() => (images = true)}>Show</button>
				<button type="button" class="plain-button small" onclick={() => void always()}>Always from {name}</button>
			</div>
		{:else if rendered?.trackers && !remembered}
			<p class="notice quiet">{rendered.trackers === 1 ? 'A tracker was' : `${rendered.trackers} trackers were`} blocked</p>
		{/if}
		<div class="body">
			{#if rendered}
				<MailBody {rendered} {images} bind:quotes expandQuotes={showQuotes} />
				{#if quotes}
					<button type="button" class="more" aria-label={showQuotes ? 'Hide quoted text' : 'Show quoted text'} onclick={() => (showQuotes = !showQuotes)} {@attach tooltip(showQuotes ? 'Hide quoted text' : 'Show quoted text')}>
						<Ellipsis size={16} />
					</button>
				{/if}
				<Attachments source={{ id: message.id }} attachments={rendered.attachments} />
			{:else if failure}
				<p class="text-[13px] text-[var(--danger)]">{failure}</p>
			{:else}
				<div class="placeholder"></div>
			{/if}
		</div>
	</article>
{:else}
	<button type="button" class="collapsed" onclick={() => reader.toggle(message.id)}>
		<Avatar picture={null} name={name} size={28} />
		<span class="flex-none text-[13.5px] font-semibold" class:unseen={!message.seen}>{name}</span>
		<span class="min-w-0 flex-1 truncate text-left text-[13px] text-[var(--text-muted)]">{message.snippet}</span>
		<span class="flex-none text-[12.5px] text-[var(--text-muted)]">{shortDate(message.date)}</span>
	</button>
{/if}

<style>
	.message {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 18px 20px;
		border-radius: 20px;
		background: var(--raised);
	}

	.edit {
		margin-top: -6px;
		min-height: 30px;
		padding-inline: 12px;
		font-size: 12.5px;
	}

	.reply {
		margin-top: -4px;
		height: 30px;
		width: 30px;
	}

	.body {
		padding-left: 48px;
	}

	.notice {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-left: 48px;
		border-radius: 12px;
		background: var(--surface);
		padding: 4px 4px 4px 12px;
		font-size: 12.5px;
		color: var(--text-muted);
	}

	.notice.quiet {
		background: none;
		padding: 0;
	}

	.small {
		min-height: 28px;
		padding-inline: 10px;
		font-size: 12.5px;
	}

	.more {
		display: grid;
		height: 20px;
		width: 34px;
		place-items: center;
		margin-top: 6px;
		border-radius: var(--radius-pill);
		background: var(--surface-hover);
		color: var(--text-muted);
	}

	.more:hover {
		background: var(--control-hover);
		color: var(--text);
	}

	.placeholder {
		height: 64px;
		border-radius: 12px;
		background: var(--surface);
		animation: pulse 1.4s ease-in-out infinite;
	}

	@keyframes pulse {
		50% {
			opacity: 0.4;
		}
	}

	.collapsed {
		display: flex;
		height: 52px;
		width: 100%;
		align-items: center;
		gap: 12px;
		border-radius: 18px;
		padding-inline: 16px 20px;
		transition: background-color 120ms var(--ease);
	}

	.collapsed:hover {
		background: var(--surface);
	}

	.unseen {
		color: var(--accent);
	}
</style>
