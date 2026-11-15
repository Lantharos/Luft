<script lang="ts">
	import { t } from '@luft/i18n';
	import { list } from '#lib/mail/list.svelte.js';

	function quiet(view: string): [string, string] {
		switch (view) {
			case 'inbox':
				return [t('mailman-empty-inbox-title'), t('mailman-empty-inbox')];
			case 'screener':
				return [t('mailman-empty-screener-title'), t('mailman-empty-screener')];
			case 'later':
				return [t('mailman-empty-later-title'), t('mailman-empty-later')];
			case 'starred':
				return [t('mailman-empty-starred-title'), t('mailman-empty-starred')];
			case 'drafts':
				return [t('mailman-empty-drafts-title'), t('mailman-empty-drafts')];
			case 'sent':
				return [t('mailman-empty-sent-title'), t('mailman-empty-sent')];
			case 'archive':
				return [t('mailman-empty-archive-title'), t('mailman-empty-archive')];
			case 'junk':
				return [t('mailman-empty-junk-title'), t('mailman-empty-junk')];
			case 'trash':
				return [t('mailman-empty-trash-title'), t('mailman-empty-trash')];
			default:
				return [t('mailman-empty-folder-title'), t('mailman-empty-folder')];
		}
	}

	let copy = $derived(list.searching ? [t('mailman-empty-search-title'), t('mailman-empty-search', { query: list.query })] : quiet(list.view));
</script>

<div class="flex flex-1 flex-col items-center justify-center gap-1.5 px-8 pb-16 text-center">
	<p class="text-[15px] font-semibold">{copy[0]}</p>
	<p class="max-w-[260px] text-[13px] leading-relaxed text-[var(--text-muted)]">{copy[1]}</p>
</div>
