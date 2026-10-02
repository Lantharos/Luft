<script lang="ts">
	import { tryMethodKey, tryMethodPick, type Shown } from './api';

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

	let typed = $state('');
	let shown = $state<Shown | null>(null);
	let focused = $state(false);

	function passThrough(event: KeyboardEvent) {
		if (event.key === 'Backspace') typed = [...typed].slice(0, -1).join('');
		else if (event.key === 'Enter') typed += '\n';
		else if ([...event.key].length === 1) typed += event.key;
	}

	function show(next: Shown) {
		typed += next.commit;
		shown = next;
	}

	async function keydown(event: KeyboardEvent) {
		if (event.ctrlKey || event.metaKey || event.altKey || event.key === 'Tab') return;
		const single = [...event.key].length === 1;
		const keysym = KEYSYMS[event.key];
		if (!single && !keysym) return;
		event.preventDefault();
		const next = await tryMethodKey(single ? { text: event.key } : { keysym });
		show(next);
		if (!next.handled) passThrough(event);
	}

	async function pick(index: number) {
		show(await tryMethodPick(index));
	}
</script>

<div class="flex flex-col gap-3">
	<div
		class="field"
		class:focused
		role="textbox"
		tabindex="0"
		aria-label="Try the input method"
		aria-multiline="true"
		onkeydown={(event) => void keydown(event)}
		onfocus={() => (focused = true)}
		onblur={() => (focused = false)}
	>
		{#if typed || shown?.preedit}
			<span class="whitespace-pre-wrap">{typed}</span><span class="preedit">{shown?.preedit ?? ''}</span>{#if focused}<span class="caret"></span>{/if}
		{:else}
			<span class="text-[var(--text-muted)]">Click here and type to try it</span>
		{/if}
	</div>
	{#if shown?.candidates.length}
		<ol class="candidates" aria-label="Candidates">
			{#each shown.candidates as candidate, index (index)}
				<li>
					<button type="button" class="candidate" class:selected={index === shown.selected} onclick={() => void pick(index)}>
						<span class="index">{index + 1}</span>
						<span class="truncate">{candidate}</span>
					</button>
				</li>
			{/each}
		</ol>
		{#if shown.total > shown.candidates.length}
			<p class="px-1 text-[12px] text-[var(--text-muted)]">{shown.first + 1}–{shown.first + shown.candidates.length} of {shown.total}, Page Down for more</p>
		{/if}
	{/if}
	{#if typed}
		<button type="button" class="plain-button self-start" onclick={() => ((typed = ''), (shown = null))}>Clear</button>
	{/if}
</div>

<style>
	.field {
		min-height: 120px;
		border-radius: 18px;
		background: var(--control);
		padding: 14px 16px;
		font-size: 18px;
		line-height: 1.5;
		outline: none;
		overflow-wrap: anywhere;
		box-shadow: inset 0 0 0 1px var(--hairline);
		transition: box-shadow 160ms var(--ease);
	}

	.field.focused {
		box-shadow: inset 0 0 0 1.5px var(--accent);
	}

	.preedit {
		text-decoration: underline;
		text-decoration-color: var(--accent);
		text-underline-offset: 4px;
	}

	.caret {
		display: inline-block;
		width: 1.5px;
		height: 1.15em;
		margin-left: 1px;
		vertical-align: text-bottom;
		background: var(--accent);
		animation: blink 1.1s steps(1) infinite;
	}

	@keyframes blink {
		50% {
			opacity: 0;
		}
	}

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
