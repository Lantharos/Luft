<script lang="ts">
	import { ContextMenu, MenuItem, MenuSeparator } from '@luft/ui';
	import type { TerminalMenu, Workspace } from '$lib/workspace/workspace.svelte';

	interface Props {
		menu: TerminalMenu;
		workspace: Workspace;
	}

	let { menu, workspace }: Props = $props();

	let session = $derived(menu.session);
	let hasSelection = $derived(session.terminal.hasSelection());

	function run(action: () => unknown) {
		workspace.menu = null;
		action();
		if (workspace.searching !== session) session.focus();
	}
</script>

<ContextMenu at={{ x: menu.x, y: menu.y }} onclose={() => (workspace.menu = null)}>
	<MenuItem disabled={!hasSelection} onclick={() => run(() => session.copySelection())}>Copy</MenuItem>
	<MenuItem onclick={() => run(() => session.terminal.selectAll())}>Select all</MenuItem>
	<MenuItem onclick={() => run(() => (workspace.searching = session))}>Find</MenuItem>
	<MenuSeparator />
	<MenuItem onclick={() => run(() => workspace.split('row'))}>Split right</MenuItem>
	<MenuItem onclick={() => run(() => workspace.split('column'))}>Split down</MenuItem>
	<MenuSeparator />
	<MenuItem onclick={() => run(() => session.terminal.clear())}>Clear scrollback</MenuItem>
	<MenuItem danger onclick={() => run(() => workspace.closeSession(session))}>Close</MenuItem>
</ContextMenu>
