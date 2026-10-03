<script lang="ts">
	import { ContextMenu, MenuItem, MenuSeparator } from '@luft/ui';
	import type { TerminalSession } from '#lib/terminal/session.svelte.js';
	import type { TerminalMenu, Workspace } from '#lib/workspace/workspace.svelte.js';

	interface Props {
		menu: TerminalMenu;
		workspace: Workspace;
	}

	let { menu, workspace }: Props = $props();

	let hasSelection = $derived(menu.session.terminal.hasSelection());

	function run(action: (session: TerminalSession) => unknown) {
		const { session } = menu;
		workspace.menu = null;
		action(session);
		if (workspace.searching !== session) session.focus();
	}
</script>

<ContextMenu at={{ x: menu.x, y: menu.y }} onclose={() => (workspace.menu = null)}>
	<MenuItem disabled={!hasSelection} onclick={() => run((session) => session.copySelection())}>Copy</MenuItem>
	<MenuItem onclick={() => run(async (session) => workspace.paste(session, await navigator.clipboard.readText()))}>Paste</MenuItem>
	<MenuItem onclick={() => run((session) => session.terminal.selectAll())}>Select all</MenuItem>
	<MenuItem onclick={() => run((session) => (workspace.searching = session))}>Find</MenuItem>
	<MenuSeparator />
	<MenuItem onclick={() => run(() => workspace.split('row'))}>Split right</MenuItem>
	<MenuItem onclick={() => run(() => workspace.split('column'))}>Split down</MenuItem>
	<MenuSeparator />
	<MenuItem onclick={() => run((session) => session.terminal.clear())}>Clear scrollback</MenuItem>
	<MenuItem danger onclick={() => run((session) => workspace.closeSession(session))}>Close</MenuItem>
</ContextMenu>
