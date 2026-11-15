<script lang="ts">
	import { t } from '@luft/i18n';
	import { Select, Switch } from '@luft/ui';
	import { search, type KindFilter, type ModifiedFilter, type SizeFilter } from '#lib/features/search.svelte.js';

	let kinds: { value: KindFilter; label: string }[] = $derived([
		{ value: 'any', label: t('rover-search-kind-any') },
		{ value: 'folder', label: t('rover-search-kind-folder') },
		{ value: 'document', label: t('rover-search-kind-document') },
		{ value: 'image', label: t('rover-search-kind-image') },
		{ value: 'video', label: t('rover-search-kind-video') },
		{ value: 'audio', label: t('rover-search-kind-audio') },
		{ value: 'archive', label: t('rover-search-kind-archive') },
		{ value: 'code', label: t('rover-search-kind-code') }
	]);
	let modified: { value: ModifiedFilter; label: string }[] = $derived([
		{ value: 'any', label: t('rover-search-modified-any') },
		{ value: 'day', label: t('rover-search-modified-day') },
		{ value: 'week', label: t('rover-search-modified-week') },
		{ value: 'month', label: t('rover-search-modified-month') },
		{ value: 'year', label: t('rover-search-modified-year') }
	]);
	let sizes: { value: SizeFilter; label: string }[] = $derived([
		{ value: 'any', label: t('rover-search-size-any') },
		{ value: 'small', label: t('rover-search-size-small') },
		{ value: 'medium', label: t('rover-search-size-medium') },
		{ value: 'large', label: t('rover-search-size-large') }
	]);

	interface Props {
		online: boolean;
	}

	let { online }: Props = $props();

	function update(change: () => void) {
		change();
		search.schedule();
	}
</script>

<div class="flex flex-wrap items-center gap-2">
	<Select label={t('rover-search-kind')} options={kinds} value={search.kind} onchange={(value) => update(() => (search.kind = value))} />
	<Select label={t('rover-search-modified')} options={modified} value={search.modified} onchange={(value) => update(() => (search.modified = value))} />
	<Select label={t('rover-search-size')} options={sizes} value={search.size} onchange={(value) => update(() => (search.size = value))} />
	<label class="ml-auto flex items-center gap-2.5 text-[13px] text-[var(--text-soft)]">
		<span>{t('rover-search-contents')}</span>
		<Switch label={t('rover-search-contents')}
 checked={search.contents && !online} disabled={online} onchange={(value) => update(() => (search.contents = value))} />
	</label>
</div>
