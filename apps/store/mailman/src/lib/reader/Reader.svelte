<script lang="ts">
	import Forward from '@lucide/svelte/icons/forward';
	import Reply from '@lucide/svelte/icons/reply';
	import ReplyAll from '@lucide/svelte/icons/reply-all';
	import { t } from '@luft/i18n';
	import { composer } from '#lib/compose/composer.svelte.js';
	import * as actions from '#lib/mail/actions.js';
	import { list } from '#lib/mail/list.svelte.js';
	import Marked from '#lib/shell/Marked.svelte';
	import MessageView from './MessageView.svelte';
	import { reader } from './reader.svelte';

	const CATEGORIES = ['newsletter', 'receipt', 'notification'];
	const FOLD_AFTER = 4;

	let messages = $derived(reader.messages);
	let latest = $derived(reader.latest);
	let unsubscribable = $derived(messages.findLast((message) => message.unsubscribe));
	let screening = $derived(list.view === 'screener' && latest ? latest.sender : null);
	let folded = $derived.by(() => {
		const collapsed = messages.slice(1, -1).filter((message) => !reader.expanded.has(message.id));
		return collapsed.length >= FOLD_AFTER ? new Set(collapsed.map((message) => message.id)) : new Set<number>();
	});
	let foldShown = $state(false);

	$effect(() => {
		void reader.thread;
		foldShown = false;
	});

	function reply(all: boolean) {
		if (latest) composer.reply(latest, reader.bodies.get(latest.id) ?? null, all);
	}
</script>

<div class="reader soft-scroll">
	<div class="mx-auto flex max-w-[880px] flex-col gap-2 px-6 pt-2 pb-12">
		<div class="flex flex-col gap-1 px-1 pb-3">
			<h1 class="text-[22px] leading-tight font-semibold">{reader.subject || '(no subject)'}</h1>
			<div class="flex items-center gap-3 text-[13px] text-[var(--text-muted)]">
				<span>{latest && CATEGORIES.includes(latest.category) ? t('mailman-reader-messages-category', { count: messages.length, category: latest.category }) : t('mailman-reader-messages', { count: messages.length })}</span>
				{#if unsubscribable && reader.thread !== null}
					<button type="button" class="link" onclick={() => void actions.unsubscribe(unsubscribable.id, unsubscribable.senderName || unsubscribable.sender, reader.thread!)}>{t('mailman-reader-unsubscribe')}</button>
				{/if}
			</div>
		</div>
		{#if screening}
			<div class="screen">
				<p class="min-w-0 flex-1 text-[13.5px] text-[var(--text-muted)]">
					<Marked text={t('mailman-reader-first-time', { sender: latest?.senderName || screening })} />
				</p>
				<button type="button" class="button" onclick={() => void actions.screen(screening, 'denied', [reader.thread!])}>{t('mailman-reader-screen-out')}</button>
				<button type="button" class="button primary" onclick={() => void actions.screen(screening, 'approved', [reader.thread!])}>{t('mailman-reader-let-in')}</button>
			</div>
		{/if}
		{#each messages as message, index (message.id)}
			{#if folded.has(message.id) && !foldShown}
				{#if index === 1}
					<button type="button" class="fold" onclick={() => (foldShown = true)}>{t('mailman-reader-earlier', { count: folded.size })}</button>
				{/if}
			{:else}
				<MessageView {message} expanded={reader.expanded.has(message.id)} />
			{/if}
		{/each}
		<div class="flex gap-2 pt-3 pl-1">
			<button type="button" class="button" onclick={() => reply(false)}><Reply size={16} />{t('mailman-reader-reply')}</button>
			<button type="button" class="button" onclick={() => reply(true)}><ReplyAll size={16} />{t('mailman-reader-reply-all')}</button>
			<button type="button" class="button" onclick={() => latest && composer.forward(latest, reader.bodies.get(latest.id) ?? null)}><Forward size={16} />{t('mailman-reader-forward')}</button>
		</div>
	</div>
</div>

<style>
	.reader {
		min-height: 0;
		flex: 1;
		overflow-y: auto;
		overscroll-behavior: contain;
	}

	.link {
		color: var(--accent);
		font-weight: 500;
	}

	.link:hover {
		text-decoration: underline;
	}

	.screen {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 6px;
		border-radius: 20px;
		background: var(--accent-soft);
		padding: 10px 10px 10px 18px;
	}

	.screen :global(b) {
		color: var(--text);
		font-weight: 600;
	}

	.fold {
		height: 36px;
		border-radius: var(--radius-pill);
		font-size: 13px;
		color: var(--text-muted);
		transition: background-color var(--motion-tap) var(--ease-decelerate);
	}

	.fold:hover {
		background: var(--surface);
		color: var(--text);
	}
</style>
