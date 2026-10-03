<script lang="ts">
	import Redo2 from '@lucide/svelte/icons/redo-2';
	import Undo2 from '@lucide/svelte/icons/undo-2';
	import { IconButton } from '@luft/ui';
	import { undoShortcuts, type Undoable } from '$lib/state/history.svelte';

	interface Props {
		target: Undoable;
	}

	let { target }: Props = $props();
</script>

<svelte:window onkeydown={undoShortcuts(target)} />

<IconButton icon={Undo2} label="Undo" disabled={!target.history.canUndo} onclick={() => target.undo()} />
<IconButton icon={Redo2} label="Redo" disabled={!target.history.canRedo} onclick={() => target.redo()} />
