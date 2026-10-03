<script lang="ts">
	import { Select, Switch } from '@luft/ui';
	import { search, type KindFilter, type ModifiedFilter, type SizeFilter } from '#lib/features/search.svelte.js';

	const KINDS: { value: KindFilter; label: string }[] = [
		{ value: 'any', label: 'Any kind' },
		{ value: 'folder', label: 'Folders' },
		{ value: 'document', label: 'Documents' },
		{ value: 'image', label: 'Images' },
		{ value: 'video', label: 'Videos' },
		{ value: 'audio', label: 'Audio' },
		{ value: 'archive', label: 'Archives' },
		{ value: 'code', label: 'Code' }
	];
	const MODIFIED: { value: ModifiedFilter; label: string }[] = [
		{ value: 'any', label: 'Any time' },
		{ value: 'day', label: 'Past day' },
		{ value: 'week', label: 'Past week' },
		{ value: 'month', label: 'Past month' },
		{ value: 'year', label: 'Past year' }
	];
	const SIZES: { value: SizeFilter; label: string }[] = [
		{ value: 'any', label: 'Any size' },
		{ value: 'small', label: 'Under 1 MB' },
		{ value: 'medium', label: '1 to 100 MB' },
		{ value: 'large', label: 'Over 100 MB' }
	];

	function update(change: () => void) {
		change();
		search.schedule();
	}
</script>

<div class="flex flex-wrap items-center gap-2">
	<Select label="Kind" options={KINDS} value={search.kind} onchange={(value) => update(() => (search.kind = value))} />
	<Select label="Modified" options={MODIFIED} value={search.modified} onchange={(value) => update(() => (search.modified = value))} />
	<Select label="Size" options={SIZES} value={search.size} onchange={(value) => update(() => (search.size = value))} />
	<label class="ml-auto flex items-center gap-2.5 text-[13px] text-[var(--text-soft)]">
		<span>Look inside files</span>
		<Switch label="Look inside files" checked={search.contents} onchange={(value) => update(() => (search.contents = value))} />
	</label>
</div>
