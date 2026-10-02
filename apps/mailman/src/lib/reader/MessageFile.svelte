<script lang="ts">
	import { Avatar } from '@luft/ui';
	import Reply from '@lucide/svelte/icons/reply';
	import * as api from '$lib/api';
	import type { OpenedFile } from '$lib/api';
	import { longDate } from '$lib/app/format';
	import { composer } from '$lib/compose/composer.svelte';
	import { mail } from '$lib/mail/mail.svelte';
	import MailBody from './MailBody.svelte';

	interface Props {
		path: string;
	}

	let { path }: Props = $props();

	let opened = $state<OpenedFile | null>(null);
	let failure = $state('');
	let images = $state(false);
	let quotes = $state(0);

	$effect(() => {
		opened = null;
		failure = '';
		void api
			.openMessageFile(path)
			.then((file) => (opened = file))
			.catch((error: unknown) => (failure = error instanceof Error ? error.message : String(error)));
	});

	function reply() {
		if (!opened) return;
		composer.start({ to: [opened.from], subject: /^re:/i.test(opened.subject) ? opened.subject : `Re: ${opened.subject}` });
	}
</script>

<div class="soft-scroll min-h-0 flex-1 overflow-y-auto">
	<div class="mx-auto flex max-w-[880px] flex-col gap-4 px-6 pt-2 pb-12">
		{#if opened}
			<h1 class="px-1 text-[22px] leading-tight font-semibold">{opened.subject || '(no subject)'}</h1>
			<article class="message">
				<header class="flex items-start gap-3">
					<Avatar picture={null} name={opened.from.name || opened.from.address} size={36} />
					<div class="min-w-0 flex-1">
						<p class="truncate text-[14px] font-semibold">{opened.from.name || opened.from.address} <span class="font-normal text-[var(--text-muted)]">{opened.from.address}</span></p>
						<p class="truncate text-[12.5px] text-[var(--text-muted)]">to {[...opened.to, ...opened.cc].map((address) => address.name || address.address).join(', ')}</p>
					</div>
					{#if opened.date}<span class="flex-none text-[12.5px] text-[var(--text-muted)]">{longDate(opened.date)}</span>{/if}
				</header>
				{#if opened.rendered.remote.length && !images}
					<button type="button" class="plain-button self-start" onclick={() => (images = true)}>Show pictures</button>
				{/if}
				<div class="pl-12"><MailBody rendered={opened.rendered} {images} bind:quotes expandQuotes /></div>
			</article>
			{#if mail.accounts.length}
				<button type="button" class="button self-start" onclick={reply}><Reply size={16} />Reply</button>
			{/if}
		{:else if failure}
			<p class="px-1 pt-10 text-center text-[14px] text-[var(--text-muted)]">{failure}</p>
		{/if}
	</div>
</div>

<style>
	.message {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 18px 20px;
		border-radius: 20px;
		background: var(--raised);
	}
</style>
