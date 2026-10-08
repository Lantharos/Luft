<script lang="ts">
	import ClipboardPaste from '@lucide/svelte/icons/clipboard-paste';
	import Copy from '@lucide/svelte/icons/copy';
	import Scissors from '@lucide/svelte/icons/scissors';
	import SquareDashedText from '@lucide/svelte/icons/square-dashed-text';
	import ContextMenu from './ContextMenu.svelte';
	import { editableAt, TextEditing } from './editing';
	import MenuItem from './MenuItem.svelte';
	import MenuSeparator from './MenuSeparator.svelte';
	import type { Point } from './placement';

	let menu = $state<{ at: Point; editing: TextEditing } | null>(null);

	function open(event: MouseEvent) {
		if (event.defaultPrevented) return;
		event.preventDefault();
		const editing = new TextEditing(editableAt(event));
		menu = editing.field || editing.selected ? { at: { x: event.clientX, y: event.clientY }, editing } : null;
	}

	function run(action: () => unknown) {
		menu = null;
		void action();
	}
</script>

<svelte:window oncontextmenu={open} onpointerdown={() => (menu = null)} onblur={() => (menu = null)} />

{#if menu}
	{@const { editing } = menu}
	<ContextMenu at={menu.at} onclose={() => (menu = null)}>
		{#if editing.field}
			<MenuItem disabled={!editing.selected || !editing.writable || !editing.copyable} onclick={() => run(editing.cut)}>
				<Scissors size={16} />
				<span>Cut</span>
			</MenuItem>
		{/if}
		<MenuItem disabled={!editing.selected || !editing.copyable} onclick={() => run(editing.copy)}>
			<Copy size={16} />
			<span>Copy</span>
		</MenuItem>
		{#if editing.field}
			<MenuItem disabled={!editing.writable} onclick={() => run(editing.paste)}>
				<ClipboardPaste size={16} />
				<span>Paste</span>
			</MenuItem>
			<MenuSeparator />
			<MenuItem onclick={() => run(editing.selectAll)}>
				<SquareDashedText size={16} />
				<span>Select All</span>
			</MenuItem>
		{/if}
	</ContextMenu>
{/if}
