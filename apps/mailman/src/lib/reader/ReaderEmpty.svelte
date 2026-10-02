<script lang="ts">
	import { list } from '$lib/mail/list.svelte';
	import { plural } from '$lib/app/format';

	let unread = $derived(list.rows.filter((row) => row.unread > 0).length);
</script>

<div class="flex flex-1 flex-col items-center justify-center gap-2 px-10 pb-20 text-center">
	<p class="text-[15px] font-semibold text-[var(--text-soft)]">{unread ? plural(unread, 'unread conversation', 'unread conversations') : 'Nothing selected'}</p>
	<p class="text-[13px] text-[var(--text-muted)]">
		<kbd>J</kbd> and <kbd>K</kbd> move through your mail, <kbd>E</kbd> archives, <kbd>Ctrl K</kbd> finds anything
	</p>
</div>

<style>
	kbd {
		border-radius: 6px;
		background: var(--control);
		padding: 1px 6px;
		font-family: inherit;
		font-size: 12px;
		color: var(--text-soft);
	}
</style>
