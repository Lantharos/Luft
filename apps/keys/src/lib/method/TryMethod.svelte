<script lang="ts">
	import { ownDeadKeysym } from '#lib/layout/dead/table.js';
	import { toast } from '#lib/state/toast.svelte.js';
	import TryField, { EDITING_KEYS } from '#lib/try/TryField.svelte';
	import { tryMethod, tryMethodKey, tryMethodPick, type Shown } from './api';
	import type { MethodEditor } from './editor.svelte';

	interface Props {
		editor: MethodEditor;
	}

	let { editor }: Props = $props();

	const KEYSYMS: Record<string, string> = {
		Backspace: 'BackSpace',
		Enter: 'Return',
		Escape: 'Escape',
		ArrowUp: 'Up',
		ArrowDown: 'Down',
		ArrowLeft: 'Left',
		ArrowRight: 'Right',
		PageUp: 'Page_Up',
		PageDown: 'Page_Down',
		Compose: 'Multi_key'
	};

	let field = $state<TryField>();
	let shown = $state<Shown | null>(null);
	let waiting = 0;
	let typing = Promise.resolve();

	let composing = $derived(Boolean(shown?.preedit || shown?.candidates.length));

	function queue(task: () => Promise<void>) {
		waiting++;
		typing = typing
			.then(task)
			.catch((error) => toast.failed(error))
			.finally(() => waiting--);
	}

	function show(next: Shown) {
		shown = next;
		field?.write(next.commit, next.preedit);
	}

	function fallback(key: string, text?: string) {
		if (text) field?.write(text, shown?.preedit ?? '');
		else field?.perform(key);
	}

	async function press(key: string, text?: string) {
		if (!text && ((!composing && key !== 'Compose') || !KEYSYMS[key])) return fallback(key);
		const next = await tryMethodKey({ text, keysym: text ? undefined : KEYSYMS[key], before: field?.before() ?? '' });
		show(next);
		if (!next.handled) fallback(key, text);
	}

	function keydown(event: KeyboardEvent) {
		if (event.ctrlKey || event.metaKey || event.altKey) return;
		const text = [...event.key].length === 1 ? event.key : undefined;
		if (!text && !KEYSYMS[event.key] && !EDITING_KEYS.has(event.key)) return;
		if (!text && !composing && !waiting && event.key !== 'Compose') return;
		event.preventDefault();
		if (text && ownDeadKeysym(text)) return;
		const key = event.key;
		queue(() => press(key, text));
	}

	function pick(index: number) {
		queue(async () => show(await tryMethodPick(index)));
	}

	function settle() {
		shown = null;
		field?.finish();
		void tryMethod(editor.snapshot());
	}
</script>

<div class="flex flex-col gap-2">
	<TryField bind:this={field} label="Try the input method" placeholder="Type to try" rows={5} onkeydown={keydown} onblur={settle} onabandon={settle} oncleared={settle} />
	{#if shown?.candidates.length}
		<ol class="candidates" aria-label="Candidates">
			{#each shown.candidates as candidate, index (index)}
				<li>
					<button type="button" class="candidate" class:selected={index === shown.selected} onpointerdown={(event) => event.preventDefault()} onclick={() => pick(index)}>
						<span class="index">{index + 1}</span>
						<span class="truncate">{candidate}</span>
					</button>
				</li>
			{/each}
			{#if shown.total > shown.candidates.length}
				<li class="px-2.5 pt-1 text-[12px] text-[var(--text-muted)]">{shown.first + 1}–{shown.first + shown.candidates.length} of {shown.total}</li>
			{/if}
		</ol>
	{/if}
</div>

<style>
	.candidates {
		display: flex;
		flex-direction: column;
		gap: 2px;
		border-radius: 18px;
		background: var(--popover);
		padding: 6px;
		box-shadow: 0 10px 30px var(--shadow-faint);
	}

	.candidate {
		display: flex;
		width: 100%;
		align-items: center;
		gap: 12px;
		border-radius: 12px;
		padding: 7px 10px;
		text-align: left;
		font-size: 16px;
		transition: background-color 120ms var(--ease);
	}

	.candidate:hover,
	.candidate.selected {
		background: var(--surface-hover);
	}

	.index {
		width: 14px;
		flex: none;
		font-size: 12px;
		color: var(--text-muted);
	}
</style>
