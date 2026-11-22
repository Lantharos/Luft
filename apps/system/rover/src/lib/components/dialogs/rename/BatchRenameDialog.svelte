<script lang="ts">
	import { tick } from 'svelte';
	import { t } from '@luft/i18n';
	import { Checkbox, Dialog, errorText, Segmented, TextField, tooltip } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { FileEntry } from '#lib/bindings.js';
	import { previewRenames, type Casing, type RenameMode, type RenameOptions } from '#lib/features/rename.js';

	interface Props {
		entries: FileEntry[];
		siblings: FileEntry[];
		onclose: () => void;
	}

	let { entries, siblings, onclose }: Props = $props();

	let modes: { value: RenameMode; label: string }[] = $derived([
		{ value: 'replace', label: t('rover-rename-mode-replace') },
		{ value: 'number', label: t('rover-rename-mode-number') },
		{ value: 'case', label: t('rover-rename-mode-case') }
	]);
	let casings: { value: Casing; label: string }[] = $derived([
		{ value: 'lower', label: t('rover-rename-case-lower') },
		{ value: 'upper', label: t('rover-rename-case-upper') },
		{ value: 'title', label: t('rover-rename-case-title') },
		{ value: 'sentence', label: t('rover-rename-case-sentence') }
	]);
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
			await commands.batchRename({ renamings: changed.map((item) => ({ path: item.entry.path, name: item.name })) });
			onclose();
		} catch (caught) {
			error = errorText(caught);
			busy = false;
		}
	}

	function submitOnEnter(event: KeyboardEvent) {
		if (event.key === 'Enter') void submit();
	}
</script>

<Dialog title={t('rover-rename-title', { count: entries.length })} wide {onclose}>
	<Segmented label={t('rover-rename-how')} options={modes} value={options.mode} onchange={(mode) => (options.mode = mode)} />

	{#if options.mode === 'replace'}
		<div class="grid grid-cols-2 gap-2">
			<TextField bind:this={field} label={t('rover-rename-find')} placeholder={t('rover-rename-find')} bind:value={options.find} onkeydown={submitOnEnter} />
			<TextField label={t('rover-rename-replacement')} placeholder={t('rover-rename-replacement')} bind:value={options.replacement} onkeydown={submitOnEnter} />
		</div>
		<Checkbox label={t('rover-rename-match-case')} checked={options.matchCase} onchange={(checked) => (options.matchCase = checked)}>
			{t('rover-rename-match-case')}
		</Checkbox>
	{:else if options.mode === 'number'}
		<div class="grid grid-cols-[minmax(0,1fr)_96px] gap-2">
			<TextField bind:this={field} label={t('rover-rename-base')} placeholder={t('rover-rename-base-placeholder')} bind:value={options.base} onkeydown={submitOnEnter} />
			<TextField label={t('rover-rename-start')} inputmode="numeric" bind:value={startText} onkeydown={submitOnEnter} />
		</div>
		<div class="flex items-center justify-between gap-3 text-[13px] text-[var(--text-soft)]">
			<span>{t('rover-rename-digits')}</span>
			<Segmented label={t('rover-rename-digits')} options={DIGITS} value={options.digits} onchange={(digits) => (options.digits = digits)} />
		</div>
	{:else}
		<Segmented label={t('rover-rename-case')} options={casings} value={options.casing} onchange={(casing) => (options.casing = casing)} />
	{/if}

	<ol class="flex max-h-[260px] flex-col overflow-y-auto rounded-[16px] bg-[var(--surface)] p-1.5 text-[13px]">
		{#each preview as item (item.entry.path)}
			<li class="grid grid-cols-[minmax(0,1fr)_16px_minmax(0,1fr)] items-center gap-2 rounded-[10px] px-2.5 py-1.5">
				<span class="truncate text-[var(--text-muted)]" {@attach tooltip(item.entry.name)}>{item.entry.name}</span>
				<span class="text-center text-[var(--text-muted)]" aria-hidden="true">→</span>
				<span
					class={['truncate', item.problem ? 'text-[var(--danger)]' : item.name === item.entry.name ? 'text-[var(--text-muted)]' : 'text-[var(--text)]']}
					{@attach tooltip(item.problem ?? item.name)}
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
		<button class="button" type="button" onclick={onclose}>{t('rover-cancel')}</button>
		<button class="button primary" type="button" disabled={busy || blocked || changed.length === 0} onclick={submit}>
			{changed.length > 0 ? t('rover-rename-confirm-count', { count: changed.length }) : t('rover-rename-confirm')}

		</button>
	{/snippet}
</Dialog>
