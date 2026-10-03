<script lang="ts">
	import type { DeadKey } from '../api';
	import type { LayoutEditor } from '../editor.svelte';
	import { typeAfter } from './table';

	interface Props {
		editor: LayoutEditor;
		key: DeadKey;
	}

	let { editor, key }: Props = $props();

	let typed = $state('');
	let pending = $state<DeadKey | null>(null);
	let focused = $state(false);

	function keydown(event: KeyboardEvent) {
		if (event.ctrlKey || event.metaKey || event.altKey || event.key === 'Tab') return;
		if (event.key === 'Backspace') {
			if (pending) pending = null;
			else typed = [...typed].slice(0, -1).join('');
		} else if (event.key === 'Escape') {
			pending = null;
		} else if ([...event.key].length === 1) {
			const result = typeAfter(pending ?? key, event.key, editor.layout.dead);
			typed += result.text;
			pending = result.pending;
		} else {
			return;
		}
		event.preventDefault();
	}
</script>

<div
	class="field"
	class:focused
	role="textbox"
	tabindex="0"
	aria-label="Try {key.name}"
	data-own-undo
	onkeydown={keydown}
	onfocus={() => (focused = true)}
	onblur={() => {
		focused = false;
		pending = null;
	}}
>
	{#if typed || pending}
		<span class="whitespace-pre-wrap">{typed}</span>{#if pending}<span class="pending">{pending.symbol}</span>{/if}{#if focused}<span class="caret"></span>{/if}
	{:else}
		<span class="text-[var(--text-muted)]">Type keys to see what {key.name} makes of them</span>
	{/if}
</div>

<style>
	.field {
		min-height: 60px;
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

	.pending {
		color: var(--secondary);
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
</style>
