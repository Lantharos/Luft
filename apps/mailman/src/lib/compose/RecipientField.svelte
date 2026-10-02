<script lang="ts">
	import { untrack } from 'svelte';
	import X from '@lucide/svelte/icons/x';
	import * as api from '$lib/api';
	import type { Address } from '$lib/api';

	interface Props {
		label: string;
		addresses: Address[];
		autofocus?: boolean;
		trailing?: import('svelte').Snippet;
	}

	let { label, addresses = $bindable(), autofocus = false, trailing }: Props = $props();

	const VALID = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

	let input = $state<HTMLInputElement>();
	let text = $state('');
	let suggestions = $state<Address[]>([]);
	let highlighted = $state(0);
	let request = 0;

	function focusOnStart(element: HTMLInputElement) {
		if (untrack(() => autofocus)) element.focus();
	}

	$effect(() => {
		const query = text.trim();
		const current = ++request;
		if (query.length < 1) {
			suggestions = [];
			return;
		}
		void api.contacts(query).then((found) => {
			if (current !== request) return;
			suggestions = found.filter((candidate) => !addresses.some((address) => address.address === candidate.address));
			highlighted = 0;
		});
	});

	function parse(raw: string): Address | null {
		const match = /^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/.exec(raw);
		const address = (match ? match[2] : raw).trim();
		return VALID.test(address) ? { name: match?.[1]?.trim() ?? '', address } : null;
	}

	function add(address: Address) {
		if (!addresses.some((existing) => existing.address === address.address)) addresses = [...addresses, address];
		text = '';
		suggestions = [];
	}

	function commit() {
		const parts = text.split(/[,;]/).map(parse);
		if (parts.every(Boolean)) parts.forEach((address) => add(address!));
	}

	function keydown(event: KeyboardEvent) {
		if (suggestions.length && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
			event.preventDefault();
			highlighted = (highlighted + (event.key === 'ArrowDown' ? 1 : suggestions.length - 1)) % suggestions.length;
		} else if ((event.key === 'Enter' || event.key === 'Tab') && suggestions.length && text.trim()) {
			event.preventDefault();
			add(suggestions[highlighted]);
		} else if ((event.key === 'Enter' || event.key === ',' || event.key === ';' || event.key === ' ') && text.trim() && parse(text)) {
			event.preventDefault();
			commit();
		} else if (event.key === 'Backspace' && !text && addresses.length) {
			addresses = addresses.slice(0, -1);
		}
	}

	function paste(event: ClipboardEvent) {
		const pasted = event.clipboardData?.getData('text') ?? '';
		const parts = pasted.split(/[,;\n]/).map(parse).filter(Boolean) as Address[];
		if (parts.length > 1) {
			event.preventDefault();
			parts.forEach(add);
		}
	}
</script>

<div class="field">
	<span class="label">{label}</span>
	<div class="chips">
		{#each addresses as address (address.address)}
			<span class="chip" title={address.address}>
				{address.name || address.address}
				<button type="button" aria-label="Remove {address.address}" onclick={() => (addresses = addresses.filter((candidate) => candidate !== address))}><X size={12} /></button>
			</span>
		{/each}
		<input bind:this={input} {@attach focusOnStart} bind:value={text} aria-label={label} spellcheck="false" autocomplete="off" onkeydown={keydown} onblur={commit} onpaste={paste} />
	</div>
	{@render trailing?.()}
	{#if suggestions.length}
		<div class="suggestions" role="listbox" aria-label="Suggestions">
			{#each suggestions as suggestion, index (suggestion.address)}
				<button
					type="button"
					role="option"
					aria-selected={index === highlighted}
					class="suggestion"
					class:highlighted={index === highlighted}
					onpointerdown={(event) => (event.preventDefault(), add(suggestion))}
				>
					<span class="truncate">{suggestion.name || suggestion.address}</span>
					{#if suggestion.name}<span class="truncate text-[12px] text-[var(--text-muted)]">{suggestion.address}</span>{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.field {
		position: relative;
		display: flex;
		min-height: 42px;
		align-items: center;
		gap: 10px;
		padding-inline: 18px 12px;
		box-shadow: inset 0 -1px 0 var(--hairline);
	}

	.label {
		width: 48px;
		flex: none;
		font-size: 13px;
		color: var(--text-muted);
	}

	.chips {
		display: flex;
		min-width: 0;
		flex: 1;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px;
		padding-block: 6px;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		border-radius: var(--radius-pill);
		background: var(--control);
		padding: 3px 6px 3px 10px;
		font-size: 13px;
	}

	.chip button {
		display: grid;
		place-items: center;
		height: 18px;
		width: 18px;
		border-radius: 50%;
		color: var(--text-muted);
	}

	.chip button:hover {
		background: var(--control-hover);
		color: var(--text);
	}

	input {
		min-width: 120px;
		flex: 1;
		background: transparent;
		font-size: 13.5px;
		outline: none;
	}

	.suggestions {
		position: absolute;
		top: calc(100% + 4px);
		left: 72px;
		z-index: 10;
		display: flex;
		width: min(360px, calc(100% - 84px));
		flex-direction: column;
		gap: 2px;
		border-radius: 16px;
		background: var(--popover);
		padding: 6px;
		box-shadow: 0 12px 40px var(--shadow-soft);
	}

	.suggestion {
		display: flex;
		min-height: 40px;
		flex-direction: column;
		justify-content: center;
		border-radius: 10px;
		padding-inline: 10px;
		text-align: left;
		font-size: 13px;
	}

	.suggestion.highlighted {
		background: var(--surface-hover);
	}
</style>
