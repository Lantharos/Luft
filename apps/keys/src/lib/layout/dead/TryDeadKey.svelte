<script lang="ts">
	import { onMount } from 'svelte';
	import TryField from '#lib/try/TryField.svelte';
	import type { DeadKey } from '../api';
	import type { LayoutEditor } from '../editor.svelte';
	import { ownDeadKeysym, typeAfter } from './table';

	interface Props {
		editor: LayoutEditor;
		key: DeadKey;
	}

	let { editor, key }: Props = $props();

	let field = $state<TryField>();
	let pending = $state<DeadKey | null>(null);

	onMount(() => field?.focus());

	function settle(text: string, next: DeadKey | null) {
		pending = next;
		field?.write(text, next?.symbol ?? '');
	}

	function drop() {
		pending = null;
		field?.cancel();
	}

	function keydown(event: KeyboardEvent) {
		if (event.ctrlKey || event.metaKey || event.altKey) return;
		if (event.key === 'Escape' || event.key === 'Backspace') {
			if (!pending) return;
			event.preventDefault();
			drop();
			return;
		}
		if ([...event.key].length !== 1) return;
		event.preventDefault();
		const current = pending ?? key;
		const dead = ownDeadKeysym(event.key);
		if (dead === current.keysym) settle(current.spacing, null);
		else if (!dead) {
			const typed = typeAfter(current, event.key, editor.layout.dead);
			settle(typed.text, typed.pending);
		}
	}
</script>

<TryField bind:this={field} label="Try {key.name}" placeholder="Type to try {key.name}" rows={1} onkeydown={keydown} onblur={drop} onabandon={drop} oncleared={() => (pending = null)} />
