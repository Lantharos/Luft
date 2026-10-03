<script lang="ts">
	import { tick } from 'svelte';
	import { Checkbox, Dialog, plural, Segmented, TextField } from '@luft/ui';
	import * as features from '#lib/features/api.js';
	import { previewRenames, type Casing, type RenameMode, type RenameOptions } from '#lib/features/rename.js';
	import type { FileEntry } from '#lib/types/index.js';
	import { errorMessage } from '#lib/utils/format.js';

	interface Props {
		entries: FileEntry[];
		siblings: FileEntry[];
		onclose: () => void;
	}

	let { entries, siblings, onclose }: Props = $props();

	const MODES: { value: RenameMode; label: string }[] = [
		{ value: 'replace', label: 'Replace text' },
		{ value: 'number', label: 'Number' },
		{ value: 'case', label: 'Change case' }
	];
	const CASINGS: { value: Casing; label: string }[] = [
		{ value: 'lower', label: 'lowercase' },
		{ value: 'upper', label: 'UPPERCASE' },
		{ value: 'title', label: 'Title Case' },
		{ value: 'sentence', label: 'Sentence case' }
	];
	const DIGITS = [1, 2, 3, 4].map((value) => ({ value, label: String(value).padStart(value, '0') }));

	let options = $state<Omit<RenameOptions, 'start'>>({
		mode: 'replace',
		find: '',
		replacement: '',
		matchCase: false,
		base: '',
		digits: 2,
		casing: 'title'
	});
	let field = $state<{ focus: () => void }>();
	let startText = $state('1');
	let busy = $state(false);
	let error = $state<string | null>(null);

	let start = $derived(Math.max(0, Number.parseInt(startText, 10) || 0));
	let preview = $derived(previewRenames(entries, siblings, { ...options, start }));
	let changed = $derived(preview.filter((item) => item.name !== item.entry.name));
	let blocked = $derived(preview.some((item) => item.problem !== null));

	$effect(() => {
		void options.mode;
		void tick().then(() => field?.focus());
	});

	async function submit() {
		if (busy || blocked || changed.length === 0) return;
		busy = true;
		error = null;
		try {
			await features.batchRename(changed.map((item) => ({ path: item.entry.path, name: item.name })));
			onclose();
		} catch (caught) {
			error = errorMessage(caught);
			busy = false;
		}
	}

	function submitOnEnter(event: KeyboardEvent) {
		if (event.key === 'Enter') void submit();
	}
</script>

<Dialog title={`Rename ${plural(entries.length, 'item')}`} wide {onclose}>
	<Segmented label="How to rename" options={MODES} value={options.mode} onchange={(mode) => (options.mode = mode)} />

	{#if options.mode === 'replace'}
		<div class="grid grid-cols-2 gap-2">
			<TextField bind:this={field} label="Find" placeholder="Find" bind:value={options.find} onkeydown={submitOnEnter} />
			<TextField label="Replace with" placeholder="Replace with" bind:value={options.replacement} onkeydown={submitOnEnter} />
		</div>
		<Checkbox label="Match case" checked={options.matchCase} onchange={(checked) => (options.matchCase = checked)}>
			Match case
		</Checkbox>
	{:else if options.mode === 'number'}
		<div class="grid grid-cols-[minmax(0,1fr)_96px] gap-2">
			<TextField bind:this={field} label="Name" placeholder="Name before the number" bind:value={options.base} onkeydown={submitOnEnter} />
			<TextField label="Start at" inputmode="numeric" bind:value={startText} onkeydown={submitOnEnter} />
		</div>
		<div class="flex items-center justify-between gap-3 text-[13px] text-[var(--text-soft)]">
			<span>Digits</span>
			<Segmented label="Digits" options={DIGITS} value={options.digits} onchange={(digits) => (options.digits = digits)} />
		</div>
	{:else}
		<Segmented label="Case" options={CASINGS} value={options.casing} onchange={(casing) => (options.casing = casing)} />
	{/if}

	<ol class="soft-scroll flex max-h-[260px] flex-col overflow-y-auto rounded-[16px] bg-[var(--surface)] p-1.5 text-[13px]">
		{#each preview as item (item.entry.path)}
			<li class="grid grid-cols-[minmax(0,1fr)_16px_minmax(0,1fr)] items-center gap-2 rounded-[10px] px-2.5 py-1.5">
				<span class="truncate text-[var(--text-muted)]" title={item.entry.name}>{item.entry.name}</span>
				<span class="text-center text-[var(--text-muted)]" aria-hidden="true">→</span>
				<span
					class={['truncate', item.problem ? 'text-[var(--danger)]' : item.name === item.entry.name ? 'text-[var(--text-muted)]' : 'text-[var(--text)]']}
					title={item.problem ?? item.name}
				>
					{item.name || item.problem}
				</span>
			</li>
		{/each}
	</ol>

	{#if error}
		<p class="text-[12px] text-[var(--danger)]">{error}</p>
	{:else if blocked}
		<p class="text-[12px] text-[var(--danger)]">{preview.find((item) => item.problem)?.problem}</p>
	{/if}

	{#snippet actions()}
		<button class="button" type="button" onclick={onclose}>Cancel</button>
		<button class="button primary" type="button" disabled={busy || blocked || changed.length === 0} onclick={submit}>
			{changed.length > 0 ? `Rename ${plural(changed.length, 'item')}` : 'Rename'}
		</button>
	{/snippet}
</Dialog>
