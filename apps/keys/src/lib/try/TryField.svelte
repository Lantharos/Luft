<script lang="ts" module>
	export const EDITING_KEYS = new Set(['Backspace', 'Delete', 'Enter', 'ArrowLeft', 'ArrowRight']);
</script>

<script lang="ts">
	import { tick } from 'svelte';
	import X from '@lucide/svelte/icons/x';
	import { tooltip } from '@luft/ui';

	interface Props {
		label: string;
		placeholder: string;
		rows?: number;
		onkeydown: (event: KeyboardEvent) => void;
		onkeyup?: (event: KeyboardEvent) => void;
		onfocus?: () => void;
		onblur?: () => void;
		onabandon?: () => void;
		oncleared?: () => void;
	}

	let { label, placeholder, rows = 2, onkeydown, onkeyup, onfocus, onblur, onabandon, oncleared }: Props = $props();

	let field = $state<HTMLTextAreaElement>();
	let mirror = $state<HTMLDivElement>();
	let preedit = $state('');
	let start = $state(0);
	let leading = $state('');
	let empty = $state(true);
	let writing = false;

	function replace(from: number, to: number, text: string) {
		if (!field) return;
		writing = true;
		if (document.activeElement === field) {
			field.setSelectionRange(from, to);
			if (text) document.execCommand('insertText', false, text);
			else if (from !== to) document.execCommand('delete');
		} else {
			field.setRangeText(text, from, to, 'end');
		}
		writing = false;
		empty = !field.value;
	}

	function span(): [number, number] {
		if (!field) return [0, 0];
		return preedit ? [start, start + preedit.length] : [field.selectionStart, field.selectionEnd];
	}

	export function write(text: string, next = '') {
		if (!field) return;
		const [from, to] = span();
		replace(from, to, text + next);
		start = from + text.length;
		preedit = next;
		leading = field.value.slice(0, start);
		void tick().then(follow);
	}

	function follow() {
		if (mirror && field) mirror.scrollTop = field.scrollTop;
	}

	export function cancel() {
		if (preedit) write('');
	}

	export function focus() {
		field?.focus();
	}

	export function finish() {
		preedit = '';
	}

	export function before() {
		return field?.value.slice(0, span()[0]) ?? '';
	}

	export function perform(key: string) {
		if (key === 'Backspace' || key === 'Delete') erase(key === 'Delete');
		else if (key === 'Enter') write('\n');
		else if (key === 'ArrowLeft' || key === 'ArrowRight') step(key === 'ArrowRight');
	}

	function width(value: string, at: number, forward: boolean) {
		const character = forward ? [...value.slice(at, at + 2)][0] : [...value.slice(Math.max(0, at - 2), at)].at(-1);
		return character?.length ?? 0;
	}

	function erase(forward: boolean) {
		finish();
		if (!field) return;
		const [from, to] = span();
		if (from !== to) replace(from, to, '');
		else if (forward) replace(from, from + width(field.value, from, true), '');
		else replace(from - width(field.value, from, false), from, '');
	}

	function step(forward: boolean) {
		finish();
		if (!field) return;
		const { selectionStart, selectionEnd, value } = field;
		let caret = forward ? selectionEnd : selectionStart;
		if (selectionStart === selectionEnd) caret += forward ? width(value, caret, true) : -width(value, caret, false);
		field.setSelectionRange(caret, caret);
	}

	function clear() {
		if (!field) return;
		preedit = '';
		field.focus();
		replace(0, field.value.length, '');
		oncleared?.();
	}

	function abandon() {
		if (!preedit) return;
		onabandon?.();
	}

	function input() {
		if (!field) return;
		empty = !field.value;
		if (!writing) abandon();
	}
</script>

<div class="try">
	{#if preedit}
		<div bind:this={mirror} class="mirror" aria-hidden="true">{leading}<span class="preedit">{preedit}</span></div>
	{/if}
	<textarea
		bind:this={field}
		{rows}
		inputmode="none"
		spellcheck="false"
		autocomplete="off"
		data-own-undo
		aria-label={label}
		{placeholder}
		{onkeydown}
		{onkeyup}
		{onfocus}
		{onblur}
		oninput={input}
		onpointerdown={abandon}
		onscroll={follow}
	></textarea>
	{#if !empty}
		<button type="button" class="clear" aria-label="Clear" {@attach tooltip('Clear')} onpointerdown={(event) => event.preventDefault()} onclick={clear}>
			<X size={15} />
		</button>
	{/if}
</div>

<style>
	.try {
		position: relative;
		border-radius: 18px;
		background: var(--control);
		box-shadow: inset 0 0 0 1px var(--hairline);
		transition: box-shadow 160ms var(--ease);
	}

	.try:focus-within {
		box-shadow: inset 0 0 0 1.5px var(--accent);
	}

	textarea,
	.mirror {
		padding: 12px 44px 12px 16px;
		font-size: 17px;
		line-height: 1.5;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}

	textarea {
		position: relative;
		display: block;
		width: 100%;
		resize: none;
		background: transparent;
		color: var(--text);
		caret-color: var(--accent);
		outline: none;
		scrollbar-width: none;
	}

	textarea::placeholder {
		color: var(--text-muted);
	}

	.mirror {
		position: absolute;
		inset: 0;
		overflow: hidden;
		color: transparent;
		pointer-events: none;
	}

	.preedit {
		text-decoration: underline 1.5px var(--accent);
		text-underline-offset: 5px;
	}

	.clear {
		position: absolute;
		top: 9px;
		right: 9px;
		display: grid;
		height: 28px;
		width: 28px;
		place-items: center;
		border-radius: var(--radius-pill);
		color: var(--text-muted);
		transition:
			background-color 140ms var(--ease),
			color 140ms var(--ease);
	}

	.clear:hover {
		background: var(--surface-hover);
		color: var(--text);
	}
</style>
