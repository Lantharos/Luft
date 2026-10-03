<script lang="ts">
	import { CODES, PHYSICAL } from '#lib/keyboard/geometry.js';
	import { toast } from '#lib/state/toast.svelte.js';
	import TryField, { EDITING_KEYS } from '#lib/try/TryField.svelte';
	import { tryKey, tryLayout } from '../api';
	import type { LayoutEditor } from '../editor.svelte';

	interface Props {
		editor: LayoutEditor;
	}

	let { editor }: Props = $props();

	let field = $state<TryField>();
	let held = new Set<string>();
	let waiting = 0;
	let typing = Promise.resolve();

	function show(name: string, down: boolean) {
		const pressed = new Set(editor.pressed);
		if (down) pressed.add(name);
		else pressed.delete(name);
		editor.pressed = pressed;
	}

	function queue(task: () => Promise<void> | void) {
		waiting++;
		typing = typing
			.then(task)
			.catch((error) => toast.failed(error))
			.finally(() => waiting--);
	}

	function keydown(event: KeyboardEvent) {
		if (event.ctrlKey || event.metaKey || (event.altKey && event.code !== 'AltRight')) return;
		const name = PHYSICAL[event.code];
		if (name) held.add(name);
		const typed = name ? tryKey(name, true) : null;
		if (typed && CODES[event.code]) {
			event.preventDefault();
			show(name, true);
			queue(async () => field?.write(await typed));
		} else if (waiting && EDITING_KEYS.has(event.key)) {
			event.preventDefault();
			const key = event.key;
			queue(() => field?.perform(key));
		}
	}

	function keyup(event: KeyboardEvent) {
		const name = PHYSICAL[event.code];
		if (!name || !held.delete(name)) return;
		void tryKey(name, false);
		if (!CODES[event.code]) return;
		event.preventDefault();
		show(name, false);
	}

	function reset() {
		held = new Set();
		editor.pressed = new Set();
		void tryLayout($state.snapshot(editor.layout));
	}
</script>

<TryField bind:this={field} label="Try the layout" placeholder="Type to try the layout" rows={2} onkeydown={keydown} onkeyup={keyup} onfocus={reset} onblur={reset} />
