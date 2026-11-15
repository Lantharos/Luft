<script lang="ts">
	import { t } from '@luft/i18n';
	import { list } from '#lib/mail/list.svelte.js';
	import Marked from '#lib/shell/Marked.svelte';

	let unread = $derived(list.rows.filter((row) => row.unread > 0).length);
</script>

<div class="flex flex-1 flex-col items-center justify-center gap-2 px-10 pb-20 text-center">
	<p class="text-[15px] font-semibold text-[var(--text-soft)]">{unread ? t('mailman-empty-reader-unread', { count: unread }) : t('mailman-empty-reader')}</p>
	<p class="text-[13px] text-[var(--text-muted)]">
		<Marked text={t('mailman-empty-reader-keys')} />
	</p>
</div>

<style>
	p :global(kbd) {
		border-radius: 6px;
		background: var(--control);
		padding: 1px 6px;
		font-family: inherit;
		font-size: 12px;
		color: var(--text-soft);
	}
</style>
