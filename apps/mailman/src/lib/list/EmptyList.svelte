<script lang="ts">
	import { list } from '$lib/mail/list.svelte';

	const QUIET: Record<string, [string, string]> = {
		inbox: ['Inbox zero', 'Everything is taken care of.'],
		screener: ['Nobody new', 'People writing to you for the first time wait here until you let them in.'],
		later: ['Nothing set aside', 'Press B on a conversation to bring it back when it suits you.'],
		starred: ['No stars', 'Press S to star what matters.'],
		drafts: ['No drafts', 'Unfinished messages are kept here.'],
		sent: ['Nothing sent yet', 'Messages you send show up here.'],
		archive: ['The archive is empty', 'Press E to archive a conversation.'],
		junk: ['No junk', 'Messages marked as junk end up here.'],
		trash: ['Trash is empty', 'Deleted messages stay here for a while.']
	};

	let copy = $derived(list.searching ? ['No matches', `Nothing found for “${list.query}”.`] : (QUIET[list.view] ?? ['Nothing here', 'This folder is empty.']));
</script>

<div class="flex flex-1 flex-col items-center justify-center gap-1.5 px-8 pb-16 text-center">
	<p class="text-[15px] font-semibold">{copy[0]}</p>
	<p class="max-w-[260px] text-[13px] leading-relaxed text-[var(--text-muted)]">{copy[1]}</p>
</div>
