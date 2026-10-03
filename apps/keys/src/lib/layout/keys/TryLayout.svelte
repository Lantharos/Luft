<script lang="ts">
	import { tryKey, tryLayout } from '../api';
	import type { LayoutEditor } from '../editor.svelte';
	import { CODES } from '$lib/keyboard/geometry';

	interface Props {
		editor: LayoutEditor;
	}

	let { editor }: Props = $props();

	let field = $state<HTMLTextAreaElement>();
	let value = $state('');

	function press(name: string, down: boolean) {
		const pressed = new Set(editor.pressed);
		if (down) pressed.add(name);
		else pressed.delete(name);
		editor.pressed = pressed;
	}

	function insert(text: string) {
		if (!field || !text) return;
		const { selectionStart, selectionEnd } = field;
		value = value.slice(0, selectionStart) + text + value.slice(selectionEnd);
		const caret = selectionStart + text.length;
		requestAnimationFrame(() => field?.setSelectionRange(caret, caret));
	}

	async function keydown(event: KeyboardEvent) {
		const name = CODES[event.code];
		if (!name || event.ctrlKey || event.metaKey || (event.altKey && event.code !== 'AltRight')) return;
		event.preventDefault();
		press(name, true);
		insert(await tryKey(name, true));
	}

	function keyup(event: KeyboardEvent) {
		const name = CODES[event.code];
		if (!name) return;
		event.preventDefault();
		press(name, false);
		void tryKey(name, false);
	}

	function reset() {
		editor.pressed = new Set();
		void tryLayout($state.snapshot(editor.layout));
	}
</script>

<textarea
	bind:this={field}
	bind:value
	class="try"
	data-own-undo
	rows="3"
	spellcheck="false"
	placeholder="Type here to try the layout"
	aria-label="Try the layout"
	onkeydown={(event) => void keydown(event)}
	onkeyup={keyup}
	onfocus={reset}
	onblur={reset}
></textarea>

<style>
	.try {
		width: 100%;
		resize: none;
		border-radius: 18px;
		background: var(--control);
		padding: 14px 16px;
		font-size: 17px;
		line-height: 1.5;
		color: var(--text);
		outline: none;
		box-shadow: inset 0 0 0 1px var(--hairline);
		transition: box-shadow 160ms var(--ease);
	}

	.try:focus {
		box-shadow: inset 0 0 0 1.5px var(--accent);
	}

	.try::placeholder {
		color: var(--text-muted);
	}
</style>
