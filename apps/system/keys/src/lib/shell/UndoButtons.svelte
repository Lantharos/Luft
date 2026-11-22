<script lang="ts">
	import { t } from '@luft/i18n';
	import Redo2 from '@luft/symbols/icons/redo-2';
	import Undo2 from '@luft/symbols/icons/undo-2';
	import { IconButton } from '@luft/ui';
	import { undoShortcuts, type Undoable } from '#lib/state/history.svelte.js';

	interface Props {
		target: Undoable;
	}

	let { target }: Props = $props();
</script>

<svelte:window onkeydown={undoShortcuts(target)} />

<IconButton icon={Undo2} label={t('keys-undo')} disabled={!target.history.canUndo} onclick={() => target.undo()} />
<IconButton icon={Redo2} label={t('keys-redo')} disabled={!target.history.canRedo} onclick={() => target.redo()} />
